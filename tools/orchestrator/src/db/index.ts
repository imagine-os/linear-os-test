/**
 * Orchestrator persistence (PAP-281): one `OrchestratorDb` interface over the
 * tables in `./schema.ts`, backed by SQLite (`node:sqlite`) in dev and by the
 * same DDL on Postgres schema `orchestrator` in production.
 *
 * Why `node:sqlite` and not `better-sqlite3`: PAP-96's spec names
 * `better-sqlite3`, but it is a native module and pnpm would need an
 * `allowBuilds` entry in the root `package.json` — a root file this issue does
 * not own (repo CLAUDE.md, "Root files"). `node:sqlite` is the same SQLite
 * engine with no build step, and PAP-93 already chose it for
 * `contract_checks`, so the whole orchestrator speaks to one driver. Swapping
 * in `better-sqlite3` later is a one-file change: it satisfies `SqliteLike`.
 *
 * `contract_checks` belongs to PAP-93 (`src/contract/store.ts`); this module
 * never creates or reads it.
 */

import { createHash } from "node:crypto";
import { CLAIM_INSERT, SCHEMA_VERSION, SQLITE_DDL } from "./schema.js";

export type SessionStatusRow =
  | "claimed"
  | "running"
  | "ended"
  | "interrupted"
  | "failed"
  | "released";

export interface SessionRow {
  id: string;
  issueId: string;
  identifier?: string;
  character: string;
  model: string | null;
  worktree: string | null;
  branch: string | null;
  status: SessionStatusRow;
  startedAt: string;
  endedAt: string | null;
  footer: unknown;
}

export interface ClaimRow {
  /** Linear issue UUID. */
  issueId: string;
  /** Linear identifier, `PAP-281`. */
  identifier: string;
  sessionId: string;
  character: string;
  claimedAt: string;
  /** The `updatedAt` observed at poll time; the claim guard compares to it. */
  updatedAtSeen: string;
}

export interface EventRow {
  id: number;
  sessionId: string | null;
  issueId: string | null;
  kind: string;
  payload: unknown;
  at: string;
}

/** The narrow slice of a SQLite driver this module uses. `node:sqlite`'s
 * `DatabaseSync` and `better-sqlite3`'s `Database` both satisfy it. */
export interface SqliteLike {
  exec(sql: string): void;
  prepare(sql: string): {
    run(...args: unknown[]): { changes?: number | bigint };
    get(...args: unknown[]): unknown;
    all(...args: unknown[]): unknown[];
  };
  close(): void;
}

export interface OrchestratorDb {
  /** Insert a claim. Returns false when another replica already holds the
   * issue — the single-winner guarantee `claimNext()` is built on. */
  insertClaim(row: ClaimRow): boolean;
  getClaim(issueId: string): ClaimRow | undefined;
  listClaims(): ClaimRow[];
  deleteClaim(issueId: string): boolean;

  insertSession(row: Omit<SessionRow, "endedAt" | "footer"> & Partial<SessionRow>): SessionRow;
  updateSession(id: string, patch: Partial<Omit<SessionRow, "id">>): void;
  getSession(id: string): SessionRow | undefined;
  listSessions(status?: SessionStatusRow): SessionRow[];

  appendEvent(event: {
    kind: string;
    sessionId?: string | null;
    issueId?: string | null;
    payload?: unknown;
    at?: string;
  }): EventRow;
  listEvents(limit?: number): EventRow[];

  /** True the first time this exact body is sent to this issue. */
  recordCommentSent(issueId: string, bodySha256: string, commentId?: string | null): boolean;
  wasCommentSent(issueId: string, bodySha256: string): boolean;
  /** Roll back a dedupe row when the post it guarded failed. */
  deleteCommentSent(issueId: string, bodySha256: string): void;

  /** Retry counter behind `transitions.retry()`; capped by config. */
  bumpRetry(issueId: string): number;
  getRetries(issueId: string): number;

  close(): void;
}

export function sha256(body: string): string {
  return createHash("sha256").update(body, "utf8").digest("hex");
}

/** Open a SQLite-backed database, creating the schema if it is not there. */
export async function openDb(path = ".data/orchestrator.db"): Promise<OrchestratorDb> {
  if (path !== ":memory:") {
    const fs = await import("node:fs/promises");
    const nodePath = await import("node:path");
    await fs.mkdir(nodePath.dirname(path), { recursive: true });
  }
  const mod = (await import("node:sqlite")) as { DatabaseSync: new (p: string) => SqliteLike };
  return new SqliteOrchestratorDb(new mod.DatabaseSync(path));
}

export class SqliteOrchestratorDb implements OrchestratorDb {
  constructor(private readonly db: SqliteLike) {
    this.db.exec(SQLITE_DDL);
    this.db
      .prepare("INSERT OR REPLACE INTO schema_meta (key, value) VALUES ('version', ?)")
      .run(String(SCHEMA_VERSION));
  }

  insertClaim(row: ClaimRow): boolean {
    const res = this.db
      .prepare(CLAIM_INSERT.sqlite)
      .run(
        row.issueId,
        row.identifier,
        row.sessionId,
        row.character,
        row.claimedAt,
        row.updatedAtSeen,
      );
    return Number(res.changes ?? 0) > 0;
  }

  getClaim(issueId: string): ClaimRow | undefined {
    const r = this.db.prepare("SELECT * FROM claims WHERE issue_id = ?").get(issueId);
    return r ? toClaim(r as Record<string, unknown>) : undefined;
  }

  listClaims(): ClaimRow[] {
    return this.db
      .prepare("SELECT * FROM claims ORDER BY claimed_at ASC")
      .all()
      .map((r) => toClaim(r as Record<string, unknown>));
  }

  deleteClaim(issueId: string): boolean {
    const res = this.db.prepare("DELETE FROM claims WHERE issue_id = ?").run(issueId);
    return Number(res.changes ?? 0) > 0;
  }

  insertSession(row: Omit<SessionRow, "endedAt" | "footer"> & Partial<SessionRow>): SessionRow {
    const full: SessionRow = {
      endedAt: null,
      footer: null,
      ...row,
    };
    this.db
      .prepare(
        "INSERT INTO sessions (id, issue_id, character, model, worktree, branch, status, started_at, ended_at, footer_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .run(
        full.id,
        full.issueId,
        full.character,
        full.model,
        full.worktree,
        full.branch,
        full.status,
        full.startedAt,
        full.endedAt,
        full.footer === null ? null : JSON.stringify(full.footer),
      );
    return full;
  }

  updateSession(id: string, patch: Partial<Omit<SessionRow, "id">>): void {
    const columns: Record<string, string> = {
      issueId: "issue_id",
      character: "character",
      model: "model",
      worktree: "worktree",
      branch: "branch",
      status: "status",
      startedAt: "started_at",
      endedAt: "ended_at",
    };
    const sets: string[] = [];
    const args: unknown[] = [];
    for (const [key, column] of Object.entries(columns)) {
      const value = (patch as Record<string, unknown>)[key];
      if (value !== undefined) {
        sets.push(`${column} = ?`);
        args.push(value);
      }
    }
    if (patch.footer !== undefined) {
      sets.push("footer_json = ?");
      args.push(patch.footer === null ? null : JSON.stringify(patch.footer));
    }
    if (sets.length === 0) return;
    args.push(id);
    this.db.prepare(`UPDATE sessions SET ${sets.join(", ")} WHERE id = ?`).run(...args);
  }

  getSession(id: string): SessionRow | undefined {
    const r = this.db.prepare("SELECT * FROM sessions WHERE id = ?").get(id);
    return r ? toSession(r as Record<string, unknown>) : undefined;
  }

  listSessions(status?: SessionStatusRow): SessionRow[] {
    const rows = status
      ? this.db
          .prepare("SELECT * FROM sessions WHERE status = ? ORDER BY started_at ASC")
          .all(status)
      : this.db.prepare("SELECT * FROM sessions ORDER BY started_at ASC").all();
    return rows.map((r) => toSession(r as Record<string, unknown>));
  }

  appendEvent(event: {
    kind: string;
    sessionId?: string | null;
    issueId?: string | null;
    payload?: unknown;
    at?: string;
  }): EventRow {
    const at = event.at ?? new Date().toISOString();
    const payload = event.payload ?? {};
    this.db
      .prepare(
        "INSERT INTO events (session_id, issue_id, kind, payload, at) VALUES (?, ?, ?, ?, ?)",
      )
      .run(event.sessionId ?? null, event.issueId ?? null, event.kind, JSON.stringify(payload), at);
    const row = this.db.prepare("SELECT * FROM events ORDER BY id DESC LIMIT 1").get();
    return toEvent(row as Record<string, unknown>);
  }

  listEvents(limit = 100): EventRow[] {
    return this.db
      .prepare("SELECT * FROM events ORDER BY id DESC LIMIT ?")
      .all(limit)
      .map((r) => toEvent(r as Record<string, unknown>));
  }

  recordCommentSent(issueId: string, bodySha256: string, commentId?: string | null): boolean {
    const res = this.db
      .prepare(
        "INSERT OR IGNORE INTO comments_sent (issue_id, body_sha256, comment_id, sent_at) VALUES (?, ?, ?, ?)",
      )
      .run(issueId, bodySha256, commentId ?? null, new Date().toISOString());
    return Number(res.changes ?? 0) > 0;
  }

  wasCommentSent(issueId: string, bodySha256: string): boolean {
    const r = this.db
      .prepare("SELECT 1 AS hit FROM comments_sent WHERE issue_id = ? AND body_sha256 = ?")
      .get(issueId, bodySha256);
    return r !== undefined && r !== null;
  }

  deleteCommentSent(issueId: string, bodySha256: string): void {
    this.db
      .prepare("DELETE FROM comments_sent WHERE issue_id = ? AND body_sha256 = ?")
      .run(issueId, bodySha256);
  }

  bumpRetry(issueId: string): number {
    const now = new Date().toISOString();
    this.db
      .prepare(
        "INSERT INTO retries (issue_id, attempts, last_at) VALUES (?, 1, ?) ON CONFLICT (issue_id) DO UPDATE SET attempts = attempts + 1, last_at = excluded.last_at",
      )
      .run(issueId, now);
    return this.getRetries(issueId);
  }

  getRetries(issueId: string): number {
    const r = this.db.prepare("SELECT attempts FROM retries WHERE issue_id = ?").get(issueId) as
      | { attempts?: number }
      | undefined;
    return Number(r?.attempts ?? 0);
  }

  close(): void {
    this.db.close();
  }
}

function toClaim(r: Record<string, unknown>): ClaimRow {
  return {
    issueId: String(r.issue_id),
    identifier: String(r.identifier),
    sessionId: String(r.session_id),
    character: String(r.character),
    claimedAt: String(r.claimed_at),
    updatedAtSeen: String(r.updated_at_seen),
  };
}

function toSession(r: Record<string, unknown>): SessionRow {
  return {
    id: String(r.id),
    issueId: String(r.issue_id),
    character: String(r.character),
    model: r.model === null || r.model === undefined ? null : String(r.model),
    worktree: r.worktree === null || r.worktree === undefined ? null : String(r.worktree),
    branch: r.branch === null || r.branch === undefined ? null : String(r.branch),
    status: String(r.status) as SessionStatusRow,
    startedAt: String(r.started_at),
    endedAt: r.ended_at === null || r.ended_at === undefined ? null : String(r.ended_at),
    footer: r.footer_json ? JSON.parse(String(r.footer_json)) : null,
  };
}

function toEvent(r: Record<string, unknown>): EventRow {
  return {
    id: Number(r.id),
    sessionId: r.session_id === null || r.session_id === undefined ? null : String(r.session_id),
    issueId: r.issue_id === null || r.issue_id === undefined ? null : String(r.issue_id),
    kind: String(r.kind),
    payload: r.payload ? JSON.parse(String(r.payload)) : {},
    at: String(r.at),
  };
}

export { CLAIM_INSERT, POSTGRES_DDL, SCHEMA_VERSION, SQLITE_DDL } from "./schema.js";

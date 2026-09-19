/**
 * `contract_checks` persistence (PAP-93). Schema per the spec:
 * `contract_checks(issue_id, checked_at, ok, violations_json)`, plus
 * `webhook_deliveries(webhook_id)` for idempotent replay (Edge cases: a
 * webhook delivered twice yields one comment).
 *
 * Two implementations behind one interface: an in-memory store for tests and
 * the webhook replay, and a SQLite store on Node's built-in `node:sqlite`
 * (no native build step; PAP-96's dev choice `better-sqlite3` needs a pnpm
 * `allowBuilds` root change, deferred to PAP-96's `src/db/`). The DDL is
 * plain SQLite/Postgres-compatible so PAP-96 can lift it into the
 * `orchestrator` schema unchanged.
 */

import type { ContractResult } from "./types.js";

export const CONTRACT_CHECKS_DDL = /* SQL */ `
CREATE TABLE IF NOT EXISTS contract_checks (
  issue_id        TEXT    NOT NULL,
  checked_at      TEXT    NOT NULL,
  ok              INTEGER NOT NULL,
  violations_json TEXT    NOT NULL
);
CREATE INDEX IF NOT EXISTS contract_checks_issue_idx ON contract_checks (issue_id, checked_at DESC);
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  webhook_id  TEXT PRIMARY KEY,
  received_at TEXT NOT NULL
);
`;

export interface ContractCheckRow {
  issueId: string;
  checkedAt: string;
  ok: boolean;
  violations: ContractResult["violations"];
}

export interface ContractCheckStore {
  record(issueId: string, result: ContractResult, checkedAt?: Date): ContractCheckRow;
  latest(issueId: string): ContractCheckRow | undefined;
  history(issueId: string): ContractCheckRow[];
  /** Returns true the first time a webhookId is seen (and remembers it); false on a replay. */
  firstDelivery(webhookId: string, receivedAt?: Date): boolean;
  close(): void;
}

export class MemoryContractCheckStore implements ContractCheckStore {
  private rows: ContractCheckRow[] = [];
  private deliveries = new Set<string>();

  record(issueId: string, result: ContractResult, checkedAt = new Date()): ContractCheckRow {
    const row: ContractCheckRow = {
      issueId,
      checkedAt: checkedAt.toISOString(),
      ok: result.ok,
      violations: result.violations,
    };
    this.rows.push(row);
    return row;
  }

  latest(issueId: string): ContractCheckRow | undefined {
    return this.history(issueId).at(-1);
  }

  history(issueId: string): ContractCheckRow[] {
    return this.rows.filter((r) => r.issueId === issueId);
  }

  firstDelivery(webhookId: string): boolean {
    if (this.deliveries.has(webhookId)) return false;
    this.deliveries.add(webhookId);
    return true;
  }

  close(): void {
    this.rows = [];
    this.deliveries.clear();
  }
}

interface SqliteLike {
  exec(sql: string): void;
  prepare(sql: string): {
    run(...args: unknown[]): unknown;
    get(...args: unknown[]): unknown;
    all(...args: unknown[]): unknown[];
  };
  close(): void;
}

/** SQLite via `node:sqlite` (Node 22.13+). `path` may be `:memory:`. */
export async function openSqliteContractCheckStore(path: string): Promise<ContractCheckStore> {
  const mod = (await import("node:sqlite")) as { DatabaseSync: new (p: string) => SqliteLike };
  const db = new mod.DatabaseSync(path);
  db.exec(CONTRACT_CHECKS_DDL);
  return new SqliteContractCheckStore(db);
}

export class SqliteContractCheckStore implements ContractCheckStore {
  constructor(private readonly db: SqliteLike) {}

  record(issueId: string, result: ContractResult, checkedAt = new Date()): ContractCheckRow {
    const row: ContractCheckRow = {
      issueId,
      checkedAt: checkedAt.toISOString(),
      ok: result.ok,
      violations: result.violations,
    };
    this.db
      .prepare(
        "INSERT INTO contract_checks (issue_id, checked_at, ok, violations_json) VALUES (?, ?, ?, ?)",
      )
      .run(row.issueId, row.checkedAt, row.ok ? 1 : 0, JSON.stringify(row.violations));
    return row;
  }

  latest(issueId: string): ContractCheckRow | undefined {
    const r = this.db
      .prepare(
        "SELECT issue_id, checked_at, ok, violations_json FROM contract_checks WHERE issue_id = ? ORDER BY checked_at DESC LIMIT 1",
      )
      .get(issueId) as RawRow | undefined;
    return r ? fromRaw(r) : undefined;
  }

  history(issueId: string): ContractCheckRow[] {
    const rows = this.db
      .prepare(
        "SELECT issue_id, checked_at, ok, violations_json FROM contract_checks WHERE issue_id = ? ORDER BY checked_at ASC",
      )
      .all(issueId) as RawRow[];
    return rows.map(fromRaw);
  }

  firstDelivery(webhookId: string, receivedAt = new Date()): boolean {
    const seen = this.db
      .prepare("SELECT 1 AS one FROM webhook_deliveries WHERE webhook_id = ?")
      .get(webhookId);
    if (seen) return false;
    this.db
      .prepare("INSERT INTO webhook_deliveries (webhook_id, received_at) VALUES (?, ?)")
      .run(webhookId, receivedAt.toISOString());
    return true;
  }

  close(): void {
    this.db.close();
  }
}

interface RawRow {
  issue_id: string;
  checked_at: string;
  ok: number;
  violations_json: string;
}

function fromRaw(r: RawRow): ContractCheckRow {
  return {
    issueId: r.issue_id,
    checkedAt: r.checked_at,
    ok: r.ok === 1,
    violations: JSON.parse(r.violations_json) as ContractResult["violations"],
  };
}

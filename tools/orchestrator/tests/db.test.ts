/**
 * The orchestrator schema (PAP-281): migrations apply, the claim primary key
 * is the atomicity guarantee, dedupe and retry counters behave, and the DDL
 * stays Postgres-shaped.
 */

import { DatabaseSync } from "node:sqlite";
import { describe, expect, it } from "vitest";
import {
  CLAIM_INSERT,
  POSTGRES_DDL,
  SQLITE_DDL,
  SqliteOrchestratorDb,
  sha256,
} from "../src/db/index.js";

function db() {
  return new SqliteOrchestratorDb(new DatabaseSync(":memory:"));
}

const claim = {
  issueId: "u-1",
  identifier: "PAP-1",
  sessionId: "s-1",
  character: "atlas",
  claimedAt: "2026-09-19T00:00:00.000Z",
  updatedAtSeen: "2026-09-19T00:00:00.000Z",
};

describe("schema", () => {
  it("applies on SQLite and is idempotent", () => {
    const raw = new DatabaseSync(":memory:");
    raw.exec(SQLITE_DDL);
    raw.exec(SQLITE_DDL);
    const tables = raw
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
      .all()
      .map((r) => (r as { name: string }).name);
    expect(tables).toEqual(
      expect.arrayContaining([
        "claims",
        "comments_sent",
        "events",
        "promotions",
        "retries",
        "schema_meta",
        "sessions",
      ]),
    );
  });

  it("does not define contract_checks, which is PAP-93's table", () => {
    expect(SQLITE_DDL).not.toContain("contract_checks");
    expect(POSTGRES_DDL).not.toContain("contract_checks");
  });

  it("carries the same tables in the Postgres DDL, under the orchestrator schema", () => {
    expect(POSTGRES_DDL).toContain("CREATE SCHEMA IF NOT EXISTS orchestrator");
    for (const table of ["sessions", "claims", "events", "comments_sent", "promotions"]) {
      expect(POSTGRES_DDL).toContain(`CREATE TABLE IF NOT EXISTS ${table} (`);
    }
    expect(CLAIM_INSERT.postgres).toContain("ON CONFLICT (issue_id) DO NOTHING");
    expect(CLAIM_INSERT.sqlite).toContain("INSERT OR IGNORE");
  });

  it("never emits a destructive statement", () => {
    for (const ddl of [SQLITE_DDL, POSTGRES_DDL]) {
      expect(ddl).not.toMatch(/\bDROP\b/i);
      expect(ddl).not.toMatch(/\bTRUNCATE\b/i);
    }
  });
});

describe("claims", () => {
  it("accepts the first insert and refuses the rest", () => {
    const d = db();
    expect(d.insertClaim(claim)).toBe(true);
    expect(d.insertClaim({ ...claim, sessionId: "s-2" })).toBe(false);
    expect(d.listClaims()).toHaveLength(1);
    expect(d.getClaim("u-1")?.sessionId).toBe("s-1");
  });

  it("frees the issue once the claim is deleted", () => {
    const d = db();
    d.insertClaim(claim);
    expect(d.deleteClaim("u-1")).toBe(true);
    expect(d.insertClaim({ ...claim, sessionId: "s-3" })).toBe(true);
  });
});

describe("sessions and events", () => {
  it("round-trips a session and patches only what is given", () => {
    const d = db();
    d.insertSession({
      id: "s-1",
      issueId: "u-1",
      character: "atlas",
      model: null,
      worktree: null,
      branch: null,
      status: "claimed",
      startedAt: "2026-09-19T00:00:00.000Z",
    });
    d.updateSession("s-1", { status: "running", worktree: "/wt/PAP-1" });
    const row = d.getSession("s-1");
    expect(row?.status).toBe("running");
    expect(row?.worktree).toBe("/wt/PAP-1");
    expect(row?.character).toBe("atlas");
    expect(d.listSessions("running")).toHaveLength(1);
  });

  it("stores the footer as JSON", () => {
    const d = db();
    d.insertSession({
      id: "s-2",
      issueId: "u-2",
      character: "atlas",
      model: "claude-opus-5",
      worktree: null,
      branch: null,
      status: "claimed",
      startedAt: "2026-09-19T00:00:00.000Z",
    });
    d.updateSession("s-2", { footer: { playbookVersion: 1, issue: "PAP-2" } });
    expect(d.getSession("s-2")?.footer).toEqual({ playbookVersion: 1, issue: "PAP-2" });
  });

  it("appends events newest-first with their payload", () => {
    const d = db();
    d.appendEvent({ kind: "issue.claimed", issueId: "u-1", payload: { a: 1 } });
    d.appendEvent({ kind: "issue.released", issueId: "u-1", payload: { reason: "hold" } });
    const events = d.listEvents();
    expect(events[0]?.kind).toBe("issue.released");
    expect(events[0]?.payload).toEqual({ reason: "hold" });
    expect(events).toHaveLength(2);
  });
});

describe("comment dedupe and retries", () => {
  it("records a hash once per issue", () => {
    const d = db();
    const hash = sha256("body");
    expect(d.recordCommentSent("u-1", hash)).toBe(true);
    expect(d.recordCommentSent("u-1", hash)).toBe(false);
    expect(d.wasCommentSent("u-1", hash)).toBe(true);
    expect(d.wasCommentSent("u-2", hash)).toBe(false);
    d.deleteCommentSent("u-1", hash);
    expect(d.wasCommentSent("u-1", hash)).toBe(false);
  });

  it("counts retries per issue", () => {
    const d = db();
    expect(d.getRetries("u-1")).toBe(0);
    expect(d.bumpRetry("u-1")).toBe(1);
    expect(d.bumpRetry("u-1")).toBe(2);
    expect(d.getRetries("u-2")).toBe(0);
  });
});

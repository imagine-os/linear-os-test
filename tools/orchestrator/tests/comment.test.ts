/**
 * `linearComment()` (PAP-281): footer append, dedupe by
 * `(issue_id, sha256(body))`, RATELIMITED retry and rollback on failure.
 */

import { DatabaseSync } from "node:sqlite";
import { beforeEach, describe, expect, it } from "vitest";
import { parseFooter, type SessionFooter } from "../src/agents/session-footer.js";
import { type OrchestratorDb, SqliteOrchestratorDb, sha256 } from "../src/db/index.js";
import { linearComment, renderComment } from "../src/linear/comment.js";
import { MockLinear, makeIssue } from "./helpers/mock-linear.js";

const footer: SessionFooter = {
  playbookVersion: 1,
  sessionId: "2026-09-19-PAP-281",
  character: "atlas",
  issue: "PAP-281",
  status: "started",
  branch: "feat/PAP-281-poll-claim-transitions",
  model: "claude-opus-5",
};

describe("linearComment", () => {
  let db: OrchestratorDb;
  beforeEach(() => {
    db = new SqliteOrchestratorDb(new DatabaseSync(":memory:"));
  });

  it("appends the PAP-92 footer as a parseable paperos-session fence", () => {
    const body = renderComment("**Session started** — hello.", footer);
    expect(body).toContain("```paperos-session");
    expect(parseFooter(body)).toEqual(footer);
  });

  it("does not append a second footer when the body already carries one", () => {
    const once = renderComment("hello", footer);
    const twice = renderComment(once, footer);
    expect(twice).toBe(once);
    expect(twice.match(/```paperos-session/g)).toHaveLength(1);
  });

  it("posts once and skips an identical body silently", async () => {
    const issue = makeIssue();
    const mock = new MockLinear({ issues: [issue] });
    const logs: string[] = [];
    const deps = { client: mock.asClient(), db, log: (m: string) => logs.push(m) };

    const first = await linearComment(deps, issue.id, "hello", footer);
    const second = await linearComment(deps, issue.id, "hello", footer);

    expect(first.posted).toBe(true);
    expect(second.posted).toBe(false);
    expect(second.reason).toBe("duplicate");
    expect(mock.comments).toHaveLength(1);
    expect(logs.join("\n")).toContain("skipped duplicate");
    expect(db.wasCommentSent(issue.id, sha256(first.body))).toBe(true);
  });

  it("dedupes per issue, not globally", async () => {
    const a = makeIssue();
    const b = makeIssue();
    const mock = new MockLinear({ issues: [a, b] });
    const deps = { client: mock.asClient(), db };

    await linearComment(deps, a.id, "same body", footer);
    await linearComment(deps, b.id, "same body", footer);

    expect(mock.comments).toHaveLength(2);
  });

  it("retries after a RATELIMITED response instead of dropping the comment", async () => {
    const issue = makeIssue();
    const mock = new MockLinear({ issues: [issue], rateLimitFirst: 2 });
    const slept: number[] = [];
    const result = await linearComment(
      {
        client: mock.asClient(),
        db,
        // Production sleeps 60 s per attempt (the spec); the test drives the
        // same code path with a zero-length sleep and records the calls.
        retry: {
          sleepMs: (attempt) => {
            slept.push(attempt);
            return 0;
          },
        },
      },
      issue.id,
      "rate limited",
      footer,
    );

    expect(slept).toEqual([1, 2]);
    expect(result.posted).toBe(true);
    expect(mock.comments).toHaveLength(1);
  });

  it("rolls the dedupe row back when the post fails, so the comment is not lost", async () => {
    const issue = makeIssue();
    const failing = new MockLinear({ issues: [issue], fail: new Error("boom") });
    await expect(
      linearComment({ client: failing.asClient(), db }, issue.id, "hello", footer),
    ).rejects.toThrow("boom");

    const hash = sha256(renderComment("hello", footer));
    expect(db.wasCommentSent(issue.id, hash)).toBe(false);

    const working = new MockLinear({ issues: [issue] });
    const retry = await linearComment(
      { client: working.asClient(), db },
      issue.id,
      "hello",
      footer,
    );
    expect(retry.posted).toBe(true);
  });

  it("writes nothing in dry-run mode but still reports the body and hash", async () => {
    const issue = makeIssue();
    const mock = new MockLinear({ issues: [issue] });
    const result = await linearComment(
      { client: mock.asClient(), db, dryRun: true },
      issue.id,
      "hello",
      footer,
    );
    expect(result.posted).toBe(false);
    expect(result.reason).toBe("dry-run");
    expect(result.bodySha256).toHaveLength(64);
    expect(mock.comments).toHaveLength(0);
  });
});

/**
 * The claim handshake (PAP-281 Definition of done).
 *
 * Atomicity, the `updatedAt` guard, the pre-claim label re-check, the
 * umbrella and Deferred filters, FIFO ordering and restart recovery.
 */

import { DatabaseSync } from "node:sqlite";
import { beforeEach, describe, expect, it } from "vitest";
import { parseConfig } from "../src/config.js";
import { type OrchestratorDb, SqliteOrchestratorDb } from "../src/db/index.js";
import { createEventBus } from "../src/events.js";
import type { ClaimDeps } from "../src/linear/claim.js";
import { claimNext, claimNextDetailed, recoverClaims, release } from "../src/linear/claim.js";
import type { IssueNode } from "../src/linear/issues.js";
import { MockLinear, makeIssue, TEST_IDS } from "./helpers/mock-linear.js";

function memoryDb(): OrchestratorDb {
  return new SqliteOrchestratorDb(new DatabaseSync(":memory:"));
}

function deps(mock: MockLinear, db: OrchestratorDb, over: Partial<ClaimDeps> = {}): ClaimDeps {
  const events = createEventBus(db);
  return {
    client: mock.asClient(),
    db,
    ids: TEST_IDS,
    events,
    config: parseConfig({ botUserId: "bot-1" }),
    now: () => new Date("2026-09-19T12:00:00.000Z"),
    log: () => {},
    ...over,
  };
}

describe("claimNext", () => {
  let db: OrchestratorDb;
  beforeEach(() => {
    db = memoryDb();
  });

  it("claims the head of the queue, moves it to In Progress and records a session", async () => {
    const issue = makeIssue();
    const mock = new MockLinear({ issues: [issue] });
    const d = deps(mock, db);

    const claim = await claimNext(d);

    expect(claim?.identifier).toBe(issue.identifier);
    expect(mock.get(issue.id)?.state.name).toBe("In Progress");
    expect(mock.get(issue.id)?.assignee?.id).toBe("bot-1");
    expect(db.getClaim(issue.id)?.sessionId).toBe(`2026-09-19-${issue.identifier}`);
    expect(db.getSession(`2026-09-19-${issue.identifier}`)?.status).toBe("claimed");
    expect(db.listEvents().some((e) => e.kind === "issue.claimed")).toBe(true);
  });

  it("yields exactly one winner for 20 concurrent claims on one issue", async () => {
    const issue = makeIssue();
    const mock = new MockLinear({ issues: [issue] });
    const d = deps(mock, db);

    const results = await Promise.all(Array.from({ length: 20 }, () => claimNext(d)));
    const winners = results.filter((r) => r !== null);

    expect(winners).toHaveLength(1);
    expect(db.listClaims()).toHaveLength(1);
    // Exactly one write reached Linear.
    expect(mock.countCalls("OrchestratorClaim")).toBe(1);
  });

  it("releases the claim when the issue moved between poll and claim (updatedAt guard)", async () => {
    const issue = makeIssue();
    const mock = new MockLinear({ issues: [issue] });
    let firstRefetch = true;
    const d = deps(mock, db, {
      refetch: async (_client, id) => {
        const fresh = structuredClone(mock.get(id)) as IssueNode;
        if (firstRefetch) {
          firstRefetch = false;
          // Justin touched it a millisecond after the poll.
          fresh.updatedAt = new Date(Date.parse(fresh.updatedAt) + 1).toISOString();
        }
        return fresh;
      },
    });

    const attempt = await claimNextDetailed(d);

    expect(attempt.claim).toBeNull();
    expect(attempt.skipped).toContainEqual({
      identifier: issue.identifier,
      reason: "guard-failed",
    });
    expect(db.listClaims()).toHaveLength(0);
    expect(mock.get(issue.id)?.state.name).toBe("Ready for Claude");
    expect(db.listEvents().some((e) => e.kind === "issue.released")).toBe(true);
  });

  it("skips an issue a human assigned between poll and claim", async () => {
    const issue = makeIssue();
    const mock = new MockLinear({ issues: [issue] });
    const d = deps(mock, db, {
      refetch: async (_client, id) => {
        const fresh = structuredClone(mock.get(id)) as IssueNode;
        fresh.assignee = { id: "justin", name: "Justin" };
        return fresh;
      },
    });

    const attempt = await claimNextDetailed(d);

    expect(attempt.claim).toBeNull();
    expect(attempt.skipped[0]?.reason).toBe("assigned-elsewhere");
    expect(mock.countCalls("OrchestratorClaim")).toBe(0);
  });

  it("catches a Deferred label added after the fetch (pre-claim re-check)", async () => {
    const issue = makeIssue();
    const mock = new MockLinear({ issues: [issue] });
    const d = deps(mock, db, {
      refetch: async (_client, id) => {
        const fresh = structuredClone(mock.get(id)) as IssueNode;
        fresh.labels = { nodes: [{ name: "Deferred", parent: null }] };
        return fresh;
      },
    });

    const attempt = await claimNextDetailed(d);

    expect(attempt.claim).toBeNull();
    expect(attempt.skipped[0]?.reason).toBe("deferred-after-fetch");
    expect(db.listClaims()).toHaveLength(0);
  });

  it("never claims a Deferred issue and says so once", async () => {
    const deferred = makeIssue({ labels: { nodes: [{ name: "Deferred", parent: null }] } });
    const ok = makeIssue();
    const mock = new MockLinear({ issues: [deferred, ok] });
    // The server-side filter is bypassed here on purpose, to prove the
    // client-side re-check stands on its own.
    const d = deps(mock, db, { fetchReady: async () => [deferred, ok] });

    const attempt = await claimNextDetailed(d);

    expect(attempt.claim?.identifier).toBe(ok.identifier);
    expect(attempt.skipped).toContainEqual({
      identifier: deferred.identifier,
      reason: "deferred",
    });
    expect(mock.comments.filter((c) => c.issueId === deferred.id)).toHaveLength(1);
    expect(mock.comments[0]?.body).toContain("not claimable: labelled `Deferred`");

    // Second pass: the dedupe in linearComment keeps it to one comment.
    await claimNextDetailed(d);
    expect(mock.comments.filter((c) => c.issueId === deferred.id)).toHaveLength(1);
  });

  it("never claims an umbrella", async () => {
    const umbrella = makeIssue({
      children: { nodes: [{ id: "c1", identifier: "PAP-c1" }] },
    });
    const leaf = makeIssue();
    const mock = new MockLinear({ issues: [umbrella, leaf] });
    const d = deps(mock, db);

    const attempt = await claimNextDetailed(d);

    expect(attempt.claim?.identifier).toBe(leaf.identifier);
    expect(attempt.skipped).toContainEqual({
      identifier: umbrella.identifier,
      reason: "umbrella",
    });
    expect(mock.comments[0]?.body).toContain("UMBRELLA_NOT_CLAIMABLE");
  });

  it("orders urgent before normal and older before newer, with no-priority last", async () => {
    const noPriority = makeIssue({ priority: 0, createdAt: "2026-09-01T00:00:00.000Z" });
    const normalOld = makeIssue({ priority: 2, createdAt: "2026-09-02T00:00:00.000Z" });
    const normalNew = makeIssue({ priority: 2, createdAt: "2026-09-05T00:00:00.000Z" });
    const urgent = makeIssue({ priority: 1, createdAt: "2026-09-09T00:00:00.000Z" });
    const mock = new MockLinear({ issues: [noPriority, normalNew, normalOld, urgent] });
    const d = deps(mock, db);

    const order: string[] = [];
    for (let i = 0; i < 4; i++) {
      const claim = await claimNext(d);
      if (claim) order.push(claim.identifier);
    }

    expect(order).toEqual([
      urgent.identifier,
      normalOld.identifier,
      normalNew.identifier,
      noPriority.identifier,
    ]);
  });

  it("honours a character filter and falls back to the configured default", async () => {
    const mine = makeIssue({
      labels: { nodes: [{ name: "Character/Atlas", parent: { name: "Character" } }] },
    });
    const theirs = makeIssue({
      labels: { nodes: [{ name: "Character/Forge", parent: { name: "Character" } }] },
    });
    const unlabelled = makeIssue();
    const mock = new MockLinear({ issues: [theirs, mine, unlabelled] });
    const d = deps(mock, db);

    const first = await claimNext(d, "atlas");
    expect(first?.identifier).toBe(mine.identifier);
    expect(first?.character).toBe("atlas");

    const second = await claimNext(d, "atlas");
    expect(second?.identifier).toBe(unlabelled.identifier);
    expect(second?.character).toBe("atlas");
  });

  it("claims unassigned and warns when no bot user is configured (PAP-48 pending)", async () => {
    const issue = makeIssue();
    const mock = new MockLinear({ issues: [issue] });
    const warnings: string[] = [];
    const d = deps(mock, db, {
      config: parseConfig({ botUserId: null }),
      log: (m) => warnings.push(m),
    });

    const claim = await claimNext(d);

    expect(claim).not.toBeNull();
    expect(mock.get(issue.id)?.state.name).toBe("In Progress");
    expect(mock.get(issue.id)?.assignee).toBeNull();
    expect(warnings.join("\n")).toContain("no botUserId configured");
  });

  it("releases the claim when another replica's write wins", async () => {
    const issue = makeIssue();
    const mock = new MockLinear({ issues: [issue] });
    let reads = 0;
    const d = deps(mock, db, {
      refetch: async (_client, id) => {
        reads += 1;
        const fresh = structuredClone(mock.get(id)) as IssueNode;
        // Read 1 is the pre-write guard and must pass; read 2 is the
        // post-write verification, by which time a second replica has moved
        // the issue on to In Review.
        if (reads === 1) return { ...fresh, updatedAt: issue.updatedAt };
        return { ...fresh, state: { id: "state-review", name: "In Review", type: "started" } };
      },
    });

    const attempt = await claimNextDetailed(d);

    expect(attempt.claim).toBeNull();
    expect(attempt.skipped).toContainEqual({ identifier: issue.identifier, reason: "write-lost" });
    expect(db.listClaims()).toHaveLength(0);
  });

  it("does not leave a claim row behind when the pre-claim re-read throws", async () => {
    const issue = makeIssue();
    const mock = new MockLinear({ issues: [issue] });
    const d = deps(mock, db, {
      refetch: async () => {
        throw new Error("Linear is down");
      },
    });

    await expect(claimNextDetailed(d)).rejects.toThrow("Linear is down");
    expect(db.listClaims()).toHaveLength(0);
  });
});

describe("release and restart recovery", () => {
  it("release deletes the claim, marks the session released and emits", () => {
    const db = memoryDb();
    const mock = new MockLinear({ issues: [] });
    const d = deps(mock, db);
    const row = {
      issueId: "u-1",
      identifier: "PAP-1",
      sessionId: "s-1",
      character: "atlas",
      claimedAt: "2026-09-19T00:00:00.000Z",
      updatedAtSeen: "2026-09-19T00:00:00.000Z",
    };
    db.insertClaim(row);
    db.insertSession({
      id: "s-1",
      issueId: "u-1",
      character: "atlas",
      model: null,
      worktree: null,
      branch: null,
      status: "claimed",
      startedAt: row.claimedAt,
    });

    release(d, row, "hold");

    expect(db.getClaim("u-1")).toBeUndefined();
    expect(db.getSession("s-1")?.status).toBe("released");
    expect(db.listEvents().some((e) => e.kind === "issue.released")).toBe(true);
  });

  it("recovers a claim whose session never started (restart mid-claim)", async () => {
    const db = memoryDb();
    const issue = makeIssue();
    const mock = new MockLinear({ issues: [issue] });
    const d = deps(mock, db);

    const claim = await claimNext(d);
    expect(claim).not.toBeNull();
    expect(db.listClaims()).toHaveLength(1);

    // The process dies here. A new process opens the same database.
    const { released } = recoverClaims(d);

    expect(released).toEqual([issue.identifier]);
    expect(db.listClaims()).toHaveLength(0);
    expect(db.getSession(`2026-09-19-${issue.identifier}`)?.status).toBe("released");

    // And the next cycle can claim it again.
    const live = mock.get(issue.id);
    if (!live) throw new Error("fixture lost");
    live.state = { id: "state-ready", name: "Ready for Claude", type: "unstarted" };
    live.assignee = null;
    const again = await claimNext(d);
    expect(again?.identifier).toBe(issue.identifier);
    // A same-day re-claim gets the `-2` re-run suffix the footer schema allows.
    expect(again?.sessionId).toBe(`2026-09-19-${issue.identifier}-2`);
  });

  it("marks a running session interrupted and releases its claim", () => {
    const db = memoryDb();
    const mock = new MockLinear({ issues: [] });
    const d = deps(mock, db);
    const row = {
      issueId: "u-9",
      identifier: "PAP-9",
      sessionId: "s-9",
      character: "atlas",
      claimedAt: "2026-09-19T11:00:00.000Z",
      updatedAtSeen: "2026-09-19T11:00:00.000Z",
    };
    db.insertClaim(row);
    db.insertSession({
      id: "s-9",
      issueId: "u-9",
      character: "atlas",
      model: null,
      worktree: "/workspace/wt/PAP-9",
      branch: "feat/PAP-9",
      status: "running",
      startedAt: row.claimedAt,
    });

    const { released, interrupted } = recoverClaims(d);

    expect(released).toEqual(["PAP-9"]);
    expect(interrupted).toEqual(["PAP-9"]);
    expect(db.getSession("s-9")?.status).toBe("interrupted");
    expect(db.getSession("s-9")?.endedAt).not.toBeNull();
  });
});

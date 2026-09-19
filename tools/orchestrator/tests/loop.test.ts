/**
 * The poll cycle (PAP-281): slots, `registerPass`, `wake`, the Linear-down
 * back-off and restart recovery on the first cycle.
 */

import { DatabaseSync } from "node:sqlite";
import { beforeEach, describe, expect, it } from "vitest";
import { parseConfig } from "../src/config.js";
import { type OrchestratorDb, SqliteOrchestratorDb } from "../src/db/index.js";
import { createEventBus } from "../src/events.js";
import { createLoop, type LoopDeps, nextBackoff } from "../src/loop.js";
import { DryRunLauncher, type SessionLauncher } from "../src/session/launcher.js";
import { MockLinear, makeIssue, TEST_IDS } from "./helpers/mock-linear.js";

function loopDeps(mock: MockLinear, db: OrchestratorDb, over: Partial<LoopDeps> = {}): LoopDeps {
  return {
    config: parseConfig({ botUserId: "bot-1", maxParallel: 2, pollIntervalMs: 5 }),
    client: mock.asClient(),
    db,
    ids: TEST_IDS,
    events: createEventBus(db),
    launcher: new DryRunLauncher(() => {}),
    log: () => {},
    sleep: async () => {},
    ...over,
  };
}

describe("createLoop", () => {
  let db: OrchestratorDb;
  beforeEach(() => {
    db = new SqliteOrchestratorDb(new DatabaseSync(":memory:"));
  });

  it("claims up to maxParallel issues per cycle and no more", async () => {
    const issues = [makeIssue(), makeIssue(), makeIssue()];
    const mock = new MockLinear({ issues });
    const loop = createLoop(loopDeps(mock, db));

    const report = await loop.runCycle();

    expect(report.claimed).toHaveLength(2);
    expect(db.listClaims()).toHaveLength(2);

    // Slots are full: a second cycle claims nothing.
    const second = await loop.runCycle();
    expect(second.claimed).toHaveLength(0);
  });

  it("hands each claim to the launcher with the worktree root", async () => {
    const issue = makeIssue();
    const mock = new MockLinear({ issues: [issue] });
    const seen: string[] = [];
    const launcher: SessionLauncher = {
      name: "spy",
      async launch(claim, context) {
        seen.push(`${claim.identifier}:${context.worktreeRoot}`);
        return { sessionId: claim.sessionId, status: "running", worktree: "/wt/x", branch: "b" };
      },
    };
    const loop = createLoop(loopDeps(mock, db, { launcher, worktreeRoot: "/workspace/wt" }));

    await loop.runCycle();

    expect(seen).toEqual([`${issue.identifier}:/workspace/wt`]);
    const session = db.listSessions()[0];
    expect(session?.status).toBe("running");
    expect(session?.worktree).toBe("/wt/x");
    expect(db.listEvents().some((e) => e.kind === "session.started")).toBe(true);
  });

  it("runs registered passes in order, after the claim pass, with the cycle's claims", async () => {
    const issue = makeIssue();
    const mock = new MockLinear({ issues: [issue] });
    const loop = createLoop(loopDeps(mock, db));
    const order: string[] = [];

    loop.registerPass("promotion", (ctx) => {
      order.push(`promotion:${ctx.claimed.map((c) => c.identifier).join(",")}`);
    });
    loop.registerPass("sla", (ctx) => {
      order.push(`sla:${ctx.cycle}`);
    });

    const report = await loop.runCycle();

    expect(loop.passes).toEqual(["promotion", "sla"]);
    expect(order).toEqual([`promotion:${issue.identifier}`, "sla:0"]);
    expect(report.passes).toEqual(["promotion", "sla"]);
  });

  it("refuses two passes with the same name and unregisters on demand", async () => {
    const mock = new MockLinear({ issues: [] });
    const loop = createLoop(loopDeps(mock, db));
    const off = loop.registerPass("promotion", () => {});
    expect(() => loop.registerPass("promotion", () => {})).toThrow(/already registered/);
    off();
    expect(loop.passes).toEqual([]);
  });

  it("keeps running when a pass throws, and records the error", async () => {
    const mock = new MockLinear({ issues: [] });
    const loop = createLoop(loopDeps(mock, db));
    loop.registerPass("bad", () => {
      throw new Error("pass exploded");
    });
    loop.registerPass("good", () => {});

    const report = await loop.runCycle();

    expect(report.errors).toContainEqual({ where: "pass:bad", message: "pass exploded" });
    expect(report.passes).toEqual(["good"]);
  });

  it("pauses claiming and backs off when Linear is down, without crashing", async () => {
    const mock = new MockLinear({ issues: [], fail: new Error("ECONNREFUSED api.linear.app") });
    const events: number[] = [];
    const deps = loopDeps(mock, db);
    deps.events.on("loop.error", (p) => events.push(p.backoffMs));
    const loop = createLoop(deps);

    const first = await loop.runCycle();
    const second = await loop.runCycle();

    expect(first.errors[0]?.where).toBe("claim");
    expect(second.errors[0]?.where).toBe("claim");
    expect(events).toEqual([1000, 2000]);
    expect(db.listClaims()).toHaveLength(0);
  });

  it("releases claims left by a crashed process on the first cycle only", async () => {
    db.insertClaim({
      issueId: "u-stale",
      identifier: "PAP-stale",
      sessionId: "s-stale",
      character: "atlas",
      claimedAt: "2026-09-19T00:00:00.000Z",
      updatedAtSeen: "2026-09-19T00:00:00.000Z",
    });
    const mock = new MockLinear({ issues: [] });
    const loop = createLoop(loopDeps(mock, db));

    await loop.runCycle();
    expect(db.listClaims()).toHaveLength(0);

    // A claim made after startup is not swept by a later cycle.
    db.insertClaim({
      issueId: "u-live",
      identifier: "PAP-live",
      sessionId: "s-live",
      character: "atlas",
      claimedAt: new Date().toISOString(),
      updatedAtSeen: new Date().toISOString(),
    });
    await loop.runCycle();
    expect(db.listClaims()).toHaveLength(1);
  });

  it("stop() ends start(), and wake() cuts the wait short", async () => {
    const mock = new MockLinear({ issues: [] });
    let cycles = 0;
    const deps = loopDeps(mock, db, {
      sleep: () => new Promise<void>(() => {}), // never resolves: only wake() can
    });
    const loop = createLoop(deps);
    loop.registerPass("count", () => {
      cycles += 1;
    });

    const started = loop.start();
    await new Promise((r) => setTimeout(r, 5));
    expect(cycles).toBe(1);

    loop.wake();
    await new Promise((r) => setTimeout(r, 5));
    expect(cycles).toBe(2);

    loop.stop();
    await started;
    expect(loop.running).toBe(false);
  });
});

describe("nextBackoff", () => {
  it("grows by the factor and stops at maxMs", () => {
    const config = parseConfig({ backoff: { initialMs: 1000, maxMs: 8000, factor: 2 } });
    expect(nextBackoff(0, config)).toBe(1000);
    expect(nextBackoff(1000, config)).toBe(2000);
    expect(nextBackoff(4000, config)).toBe(8000);
    expect(nextBackoff(8000, config)).toBe(8000);
  });
});

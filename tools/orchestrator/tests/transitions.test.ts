/**
 * State transitions (PAP-281) against the mocked SDK: `toInReview` in both
 * modes, `retry` with its cap, `escalate`, and the absence of any path to
 * Done.
 */

import { DatabaseSync } from "node:sqlite";
import { beforeEach, describe, expect, it } from "vitest";
import type { SessionFooter } from "../src/agents/session-footer.js";
import type { Mode } from "../src/config.js";
import { type OrchestratorDb, SqliteOrchestratorDb } from "../src/db/index.js";
import { createEventBus } from "../src/events.js";
import * as transitions from "../src/linear/transitions.js";
import { escalate, retry, type TransitionDeps, toInReview } from "../src/linear/transitions.js";
import { MockLinear, makeIssue, TEST_IDS } from "./helpers/mock-linear.js";

/** Put the fixture issue back In Progress between retries. */
function backToInProgress(mock: MockLinear, id: string): void {
  const live = mock.get(id);
  if (!live) throw new Error(`fixture lost ${id}`);
  live.state = { id: "state-progress", name: "In Progress", type: "started" };
}

const inProgress = { id: "state-progress", name: "In Progress", type: "started" };

function deps(mock: MockLinear, db: OrchestratorDb, mode: Mode = "build-loop"): TransitionDeps {
  return {
    client: mock.asClient(),
    db,
    ids: structuredClone(TEST_IDS),
    events: createEventBus(db),
    mode,
    maxRetries: 2,
    log: () => {},
  };
}

const footer: SessionFooter = {
  playbookVersion: 1,
  sessionId: "2026-09-19-PAP-1",
  character: "atlas",
  issue: "PAP-1",
  status: "ended",
  branch: "feat/PAP-1",
};

describe("toInReview", () => {
  let db: OrchestratorDb;
  beforeEach(() => {
    db = new SqliteOrchestratorDb(new DatabaseSync(":memory:"));
  });

  it("build-loop mode: commits are the evidence, no PR and no attachment", async () => {
    const issue = makeIssue({ state: inProgress });
    const mock = new MockLinear({ issues: [issue] });
    db.insertClaim({
      issueId: issue.id,
      identifier: issue.identifier,
      sessionId: "s1",
      character: "atlas",
      claimedAt: "2026-09-19T00:00:00.000Z",
      updatedAtSeen: issue.updatedAt,
    });

    const result = await toInReview(
      deps(mock, db),
      issue,
      "commits abc1234, def5678 on main of imagine-os/empty12",
      footer,
    );

    expect(result).toEqual({ ok: true, state: "In Review" });
    expect(mock.get(issue.id)?.state.name).toBe("In Review");
    expect(mock.attachments).toHaveLength(0);
    expect(db.getClaim(issue.id)).toBeUndefined();
    expect(mock.comments[0]?.body).toContain("**Session ended** — commits abc1234");
  });

  it("pr-flow mode: attaches the PR and emits pr.detected", async () => {
    const issue = makeIssue({ state: inProgress });
    const mock = new MockLinear({ issues: [issue] });
    const d = deps(mock, db, "pr-flow");
    const seen: string[] = [];
    d.events.on("pr.detected", (p) => seen.push(p.url));

    const result = await toInReview(d, issue, "https://github.com/imagine-os/toy/pull/3", footer);

    expect(result.ok).toBe(true);
    expect(mock.attachments).toEqual([
      { issueId: issue.id, url: "https://github.com/imagine-os/toy/pull/3" },
    ]);
    expect(seen).toEqual(["https://github.com/imagine-os/toy/pull/3"]);
  });

  it("pr-flow mode refuses a non-URL evidence string instead of moving the issue", async () => {
    const issue = makeIssue({ state: inProgress });
    const mock = new MockLinear({ issues: [issue] });

    const result = await toInReview(deps(mock, db, "pr-flow"), issue, "commits abc1234");

    expect(result.ok).toBe(false);
    expect(result.reason).toContain("PR URL");
    expect(mock.get(issue.id)?.state.name).toBe("In Progress");
  });

  it("has no path to Done: the review pass owns that move", () => {
    expect(Object.keys(transitions)).not.toContain("toDone");
    expect(JSON.stringify(TEST_IDS.states)).toContain("Done");
  });
});

describe("retry", () => {
  let db: OrchestratorDb;
  beforeEach(() => {
    db = new SqliteOrchestratorDb(new DatabaseSync(":memory:"));
  });

  it("re-queues to Ready for Claude with an incrementing retry-<n> label", async () => {
    const issue = makeIssue({ state: inProgress });
    const mock = new MockLinear({ issues: [issue] });
    const d = deps(mock, db);

    const first = await retry(d, issue, "session ended with no commits");
    expect(first).toEqual({ ok: true, state: "Ready for Claude" });
    expect(mock.get(issue.id)?.state.name).toBe("Ready for Claude");
    expect(mock.get(issue.id)?.assignee).toBeNull();
    expect(mock.labelsCreated).toEqual(["retry-1"]);

    backToInProgress(mock, issue.id);
    await retry(d, issue, "again");
    expect(mock.labelsCreated).toEqual(["retry-1", "retry-2"]);
    expect(db.getRetries(issue.id)).toBe(2);
  });

  it("escalates to Needs Justin once the cap is passed", async () => {
    const issue = makeIssue({ state: inProgress });
    const mock = new MockLinear({ issues: [issue] });
    const d = deps(mock, db);

    await retry(d, issue, "1");
    backToInProgress(mock, issue.id);
    await retry(d, issue, "2");
    backToInProgress(mock, issue.id);
    const third = await retry(d, issue, "3");

    expect(third.state).toBe("Needs Justin");
    expect(mock.get(issue.id)?.state.name).toBe("Needs Justin");
    expect(mock.comments.at(-1)?.body).toContain("retry cap 2 reached");
    expect(db.listEvents().some((e) => e.kind === "issue.escalated")).toBe(true);
  });

  it("re-queues even when the retry label cannot be created", async () => {
    const issue = makeIssue({ state: inProgress });
    const mock = new MockLinear({ issues: [issue] });
    const d = deps(mock, db);
    const original = mock.asClient;
    // Make only issueLabelCreate fail.
    d.client = {
      client: {
        rawRequest: async (q: string, v: Record<string, unknown>) => {
          if (q.includes("issueLabelCreate(")) throw new Error("label API is down");
          return (
            original.call(mock) as unknown as {
              client: { rawRequest: (q: string, v: Record<string, unknown>) => Promise<unknown> };
            }
          ).client.rawRequest(q, v);
        },
      },
    } as unknown as typeof d.client;

    const result = await retry(d, issue, "no commits");

    expect(result).toEqual({ ok: true, state: "Ready for Claude" });
    expect(mock.get(issue.id)?.state.name).toBe("Ready for Claude");
  });
});

describe("escalate", () => {
  it("moves to Needs Justin and posts a PAP-94 card", async () => {
    const db = new SqliteOrchestratorDb(new DatabaseSync(":memory:"));
    const issue = makeIssue({ state: inProgress });
    const mock = new MockLinear({ issues: [issue] });

    await escalate(deps(mock, db), issue, "the Hetzner account does not exist yet");

    expect(mock.get(issue.id)?.state.name).toBe("Needs Justin");
    const body = mock.comments[0]?.body ?? "";
    expect(body).toContain("**Needs Justin**");
    expect(body).toContain("**Decision needed:**");
    expect(body).toContain("**Default if no answer:**");
  });
});

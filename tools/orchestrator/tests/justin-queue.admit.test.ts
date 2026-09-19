import { describe, expect, it } from "vitest";
import { admit, admitNext, slotsUsed } from "../src/justin-queue/admit.js";
import type { QueueEntry } from "../src/justin-queue/card.js";
import { makeCard } from "./fixtures/justin-card.fixture.js";

const NOW = new Date("2026-09-19T12:00:00.000Z");

function entry(over: Record<string, unknown>, queuedAt?: string): QueueEntry {
  return { card: makeCard({ status: "open", ...over }), previousState: "In Progress", queuedAt };
}

function fullQueue(): QueueEntry[] {
  return [1, 2, 3, 4, 5].map((n) =>
    entry({
      key: `card-${n}`,
      nj: `NJ-${n}`,
      asks: [{ id: `NJ-${n}.1`, ask: `ask ${n}`, default: "wait" }],
      openedAt: `2026-09-1${n}T00:00:00.000Z`,
      priority: 2,
      urgent: false,
    }),
  );
}

describe("admission: what qualifies", () => {
  it("admits a credential batch into an empty queue", () => {
    const r = admit(makeCard(), [], NOW);
    expect(r.outcome).toBe("admitted");
    if (r.outcome === "admitted") {
      expect(r.card.status).toBe("open");
      expect(r.openAfter).toBe(1);
    }
  });

  it("refuses code review, test failures and library choices", () => {
    for (const category of ["code-review", "test-failure", "library-choice"]) {
      const r = admit({ ...makeCard(), category }, [], NOW);
      expect(r.outcome).toBe("refused");
      if (r.outcome === "refused") expect(r.code).toBe("NOT_A_HUMAN_DECISION");
    }
  });

  it("refuses anything a spec, ADR or rubric already decides", () => {
    const r = admit({ ...makeCard(), category: "already-decided" }, [], NOW);
    expect(r.outcome === "refused" && r.reason).toMatch(/already decides/);
  });

  it("refuses spend under the threshold and admits at it", () => {
    const under = admit({ ...makeCard(), category: "spend", spendUsd: 499 }, [], NOW);
    expect(under.outcome === "refused" && under.code).toBe("BELOW_SPEND_THRESHOLD");
    const at = admit({ ...makeCard(), category: "spend", spendUsd: 500 }, [], NOW);
    expect(at.outcome).toBe("admitted");
  });

  it("refuses a malformed card with the offending path", () => {
    const r = admit({ ...makeCard(), nj: "2" }, [], NOW);
    expect(r.outcome === "refused" && r.code).toBe("INVALID_CARD");
    expect(r.outcome === "refused" && r.reason).toMatch(/^nj:/);
  });

  it("refuses a sixth ask before the schema even runs", () => {
    const asks = [1, 2, 3, 4, 5, 6].map((n) => ({ id: `NJ-2.${n}`, ask: "x", default: "wait" }));
    const r = admit({ ...makeCard(), asks }, [], NOW);
    expect(r.outcome === "refused" && r.code).toBe("TOO_MANY_ASKS");
  });

  it("refuses an ask with neither a default nor a hard block", () => {
    const r = admit(
      { ...makeCard(), asks: [{ id: "NJ-2.1", ask: "x", default: " ", hardBlock: false }] },
      [],
      NOW,
    );
    expect(r.outcome === "refused" && r.code).toBe("NO_DEFAULT");
  });
});

describe("dedupe by key", () => {
  it("merges a second card for the same subject", () => {
    const open = [entry({})];
    const r = admit(
      makeCard({
        asks: [
          { id: "NJ-2.1", ask: "Hetzner", default: "wait" },
          { id: "NJ-2.5", ask: "Backup bucket", default: "restic to local disk" },
        ],
      }),
      open,
      NOW,
    );
    expect(r.outcome).toBe("deduped");
    if (r.outcome === "deduped") {
      expect(r.into).toBe("infra-batch");
      expect(r.merged).toEqual(["NJ-2.5"]);
    }
  });

  it("does not dedupe against a closed card", () => {
    const r = admit(makeCard(), [entry({ status: "approved" })], NOW);
    expect(r.outcome).toBe("admitted");
  });
});

describe("the five-open cap", () => {
  it("queues the sixth card with the overflow label", () => {
    const r = admit(
      makeCard({ key: "sixth", nj: "NJ-6", asks: [{ id: "NJ-6.1", ask: "x", default: "wait" }] }),
      fullQueue(),
      NOW,
    );
    expect(r.outcome).toBe("queued");
    if (r.outcome === "queued") {
      expect(r.label).toBe("queued-for-justin");
      expect(r.card.status).toBe("queued");
      expect(r.position).toBe(1);
    }
  });

  it("an urgent card bumps the oldest non-urgent one", () => {
    const r = admit(
      makeCard({
        key: "rc3",
        nj: "NJ-20",
        urgent: true,
        priority: 1,
        asks: [{ id: "NJ-20.1", ask: "tag v0.1.0", default: "hold the tag" }],
      }),
      fullQueue(),
      NOW,
    );
    expect(r.outcome).toBe("admitted");
    if (r.outcome === "admitted") expect(r.bumped).toBe("card-1");
  });

  it("an urgent card still queues when every open card is urgent", () => {
    const queue = fullQueue().map((e) => ({ ...e, card: { ...e.card, urgent: true } }));
    const r = admit(
      makeCard({
        key: "rc3",
        nj: "NJ-20",
        urgent: true,
        asks: [{ id: "NJ-20.1", ask: "x", default: "hold" }],
      }),
      queue,
      NOW,
    );
    expect(r.outcome).toBe("queued");
  });

  it("admits on a freed slot by priority then age", () => {
    const queue: QueueEntry[] = [
      ...fullQueue().slice(0, 4),
      entry(
        {
          key: "w-old",
          nj: "NJ-7",
          status: "queued",
          priority: 2,
          asks: [{ id: "NJ-7.1", ask: "x", default: "d" }],
        },
        "2026-09-18T00:00:00.000Z",
      ),
      entry(
        {
          key: "w-urgent",
          nj: "NJ-8",
          status: "queued",
          priority: 1,
          asks: [{ id: "NJ-8.1", ask: "x", default: "d" }],
        },
        "2026-09-19T00:00:00.000Z",
      ),
    ];
    const next = admitNext(queue);
    expect(next.map((c) => c.key)).toEqual(["w-urgent"]);
    expect(next[0]?.status).toBe("open");
  });

  it("admits nothing while the queue is full", () => {
    expect(
      admitNext([
        ...fullQueue(),
        entry({
          key: "waiting",
          nj: "NJ-7",
          status: "queued",
          asks: [{ id: "NJ-7.1", ask: "x", default: "d" }],
        }),
      ]),
    ).toEqual([]);
  });

  it("reports slot usage for the digest", () => {
    expect(slotsUsed(fullQueue())).toEqual({ open: 5, max: 5, queued: 0, overflow: false });
  });
});

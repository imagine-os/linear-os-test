import { describe, expect, it } from "vitest";
import type { QueueEntry } from "../src/justin-queue/card.js";
import { loadJustinQueueConfig } from "../src/justin-queue/config.js";
import { applyDefault, defaultAppliesAt, defaults } from "../src/justin-queue/defaults.js";
import { parseReply } from "../src/justin-queue/parse-reply.js";
import { applyReply } from "../src/justin-queue/resolve.js";
import { makeCard } from "./fixtures/justin-card.fixture.js";

const OPENED = "2026-09-19T00:00:00.000Z";
const config = loadJustinQueueConfig();

function entry(over: Record<string, unknown> = {}): QueueEntry {
  return {
    card: makeCard({ openedAt: OPENED, status: "open", ...over }),
    previousState: "In Progress",
  };
}

/** The fake clock the Definition of done asks for: n hours after opening. */
function at(hours: number): Date {
  return new Date(Date.parse(OPENED) + hours * 3_600_000);
}

describe("what happens on silence", () => {
  it("waits inside the 48 h window", () => {
    const [d] = defaults([entry()], at(47));
    expect(d?.action).toBe("wait");
    if (d?.action === "wait") expect(d.dueInHours).toBeCloseTo(1, 5);
  });

  it("applies the default at exactly 48 h, one decision per ask", () => {
    const [d] = defaults([entry()], at(48));
    expect(d?.action).toBe("apply-default");
    if (d?.action !== "apply-default") return;
    expect(d.decisions.map((x) => x.target)).toEqual(["NJ-2.1", "NJ-2.2", "NJ-2.3", "NJ-2.4"]);
    expect(d.decisions.every((x) => x.source === "default" && x.verb === "approve")).toBe(true);
    expect(d.summary).toMatch(/sslip.io/);
  });

  it("never auto-applies a hard block, however old", () => {
    const [d] = defaults([entry({ hardBlock: true })], at(500));
    expect(d?.action).toBe("hold");
    if (d?.action === "hold") expect(d.nudge).toBe(true);
  });

  it("treats a card with one hard-block ask as a hard block", () => {
    const card = makeCard({ openedAt: OPENED, status: "open" });
    const asks = card.asks.map((a, i) => (i === 1 ? { ...a, hardBlock: true } : a));
    const [d] = defaults([{ card: { ...card, asks }, previousState: "In Progress" }], at(72));
    expect(d?.action).toBe("hold");
  });

  it("honours a deadline earlier than the 48 h window", () => {
    const card = makeCard({ openedAt: OPENED, deadline: "2026-09-19T06:00:00.000Z" });
    expect(defaultAppliesAt(card, config).toISOString()).toBe("2026-09-19T06:00:00.000Z");
    expect(
      defaults([{ card: { ...card, status: "open" }, previousState: "In Progress" }], at(7))[0]
        ?.action,
    ).toBe("apply-default");
  });

  it("nudges once a day while a card is open", () => {
    expect(defaults([entry()], at(23))[0]).toMatchObject({ nudge: false });
    expect(defaults([entry()], at(25))[0]).toMatchObject({ nudge: true });
    const nudged = { ...entry(), lastNudgeAt: at(24).toISOString() };
    expect(defaults([nudged], at(30))[0]).toMatchObject({ nudge: false });
  });

  it("closes the card as defaulted and frees the slot", () => {
    const e = entry();
    const [d] = defaults([e], at(49));
    if (!d) throw new Error("no disposition");
    const after = applyDefault(e, d);
    expect(after.card.status).toBe("defaulted");
    expect(after.card.asks.every((a) => a.status === "defaulted")).toBe(true);
  });

  it("skips cards that are not open", () => {
    expect(defaults([entry({ status: "queued" }), entry({ status: "approved" })], at(99))).toEqual(
      [],
    );
  });
});

describe("applying a reply", () => {
  it("approves the whole card and sends the issue back to Ready for Claude", () => {
    const r = applyReply(
      entry(),
      parseReply("/approve option 2", { author: "Justin Massion" }),
      at(2),
    );
    expect(r.entry.card.status).toBe("approved");
    expect(r.moveTo).toBe("Ready for Claude");
    expect(r.acknowledgement).toContain("option 2: Hetzner cpx41 + sslip.io");
  });

  it("rejects with the reason and parks the issue in Backlog", () => {
    const r = applyReply(
      entry(),
      parseReply("/reject wrong provider", { author: "Justin Massion" }),
      at(2),
    );
    expect(r.entry.card.status).toBe("rejected");
    expect(r.moveTo).toBe("Backlog");
    expect(r.acknowledgement).toContain("wrong provider");
  });

  it("closes the card once every ask is answered one by one", () => {
    let e = entry();
    for (const id of ["NJ-2.1", "NJ-2.2", "NJ-2.3", "NJ-2.4"]) {
      e = applyReply(e, parseReply(`${id}: approve`, { author: "Justin Massion" }), at(1)).entry;
    }
    expect(e.card.status).toBe("approved");
  });

  it("acknowledges and ignores a reply on a closed card", () => {
    const r = applyReply(
      entry({ status: "approved" }),
      parseReply("/reject", { author: "Justin Massion" }),
      at(60),
    );
    expect(r.changed).toBe(false);
    expect(r.acknowledgement).toMatch(/already approved; noted and ignored/);
  });

  it("ignores a decision aimed at another card", () => {
    const r = applyReply(
      entry(),
      parseReply("PAP-999: approve", { author: "Justin Massion" }),
      at(1),
    );
    expect(r.changed).toBe(false);
    expect(r.entry.card.status).toBe("open");
  });

  it("does nothing at all for an unauthorised author", () => {
    const r = applyReply(entry(), parseReply("/approve", { author: "Sentinel" }), at(1));
    expect(r.changed).toBe(false);
    expect(r.acknowledgement).toBe("");
  });
});

import { describe, expect, it } from "vitest";
import { loadJustinQueueConfig } from "../src/justin-queue/config.js";
import {
  type Decision,
  decisionFromStateChange,
  isAuthorizedReplier,
  parseReply,
} from "../src/justin-queue/parse-reply.js";

const JUSTIN = { author: "Justin Massion" };

function first(text: string): Decision | undefined {
  return parseReply(text, JUSTIN).decisions[0];
}

/** The 30-reply fixture suite the Definition of done names, typos included. */
const FIXTURES: [string, Partial<Decision>][] = [
  ["/approve", { verb: "approve" }],
  ["approve", { verb: "approve" }],
  ["Approved.", { verb: "approve" }],
  ["APPROVE", { verb: "approve" }],
  ["aprove", { verb: "approve", corrected: true }],
  ["approv", { verb: "approve", corrected: true }],
  ["ok", { verb: "approve" }],
  ["yes", { verb: "approve" }],
  ["lgtm", { verb: "approve" }],
  ["ship it", { verb: "approve" }],
  ["/approve option 2", { verb: "approve", option: 2 }],
  ["approve 3", { verb: "approve", option: 3 }],
  ["/reject too expensive", { verb: "reject", reason: "too expensive" }],
  ["reject: not this week", { verb: "reject", reason: "not this week" }],
  ["rejcet the hetzner route", { verb: "reject", corrected: true }],
  ["no", { verb: "reject" }],
  ["denied — use sslip.io", { verb: "reject" }],
  ["/option 2", { verb: "option", option: 2 }],
  ["option 1", { verb: "option", option: 1 }],
  ["opt 3", { verb: "option", option: 3 }],
  ["2", { verb: "option", option: 2 }],
  ["optoin 2", { verb: "option", option: 2, corrected: true }],
  ["/defer 3d", { verb: "defer", days: 3 }],
  ["defer 2 days", { verb: "defer", days: 2 }],
  ["defered 5d", { verb: "defer", days: 5, corrected: true }],
  ["snooze 1d", { verb: "defer", days: 1 }],
  [
    "/ask: what does cpx41 cost a month?",
    { verb: "ask", question: "what does cpx41 cost a month?" },
  ],
  ["ask: who holds the sops key?", { verb: "ask", question: "who holds the sops key?" }],
  ["is Resend free at this volume?", { verb: "ask" }],
  ["PAP-25: approve", { verb: "approve", target: "PAP-25" }],
];

describe("reply grammar: 30 fixtures", () => {
  it.each(FIXTURES)("parses %j", (text, expected) => {
    const d = first(text);
    expect(d, `no decision parsed from ${text}`).toBeDefined();
    for (const [k, v] of Object.entries(expected)) {
      expect(d?.[k as keyof Decision], `${text} → ${k}`).toEqual(v);
    }
  });

  it("covers all five verbs", () => {
    const verbs = new Set(FIXTURES.map(([t]) => first(t)?.verb));
    expect([...verbs].sort()).toEqual(["approve", "ask", "defer", "option", "reject"]);
  });
});

describe("targets and batching", () => {
  it("reads several cards from one comment", () => {
    const r = parseReply("PAP-25: approve\nNJ-7: option 2\nNJ-13: defer 3d", JUSTIN);
    expect(r.decisions.map((d) => [d.target, d.verb, d.option ?? d.days])).toEqual([
      ["PAP-25", "approve", undefined],
      ["NJ-7", "option", 2],
      ["NJ-13", "defer", 3],
    ]);
  });

  it("answers one ask of a batched card", () => {
    expect(first("NJ-2.3: reject we already pay for Postmark")).toMatchObject({
      target: "NJ-2.3",
      verb: "reject",
      reason: "we already pay for Postmark",
    });
  });

  it("ignores quoted text and fenced blocks", () => {
    const r = parseReply(
      '> **Needs Justin — NJ-2**\n> /approve is the grammar\n```paperos-card\n{"key":"x"}\n```\n/reject wrong account',
      JUSTIN,
    );
    expect(r.decisions).toHaveLength(1);
    expect(r.decisions[0]).toMatchObject({ verb: "reject", reason: "wrong account" });
  });
});

describe("authorisation and misses", () => {
  it("obeys only the authorised replier", () => {
    expect(parseReply("/approve", { author: "Atlas (bot)" })).toEqual({
      authorized: false,
      decisions: [],
      unparsed: [],
    });
    expect(parseReply("/approve", { author: "justin@example.com" }).authorized).toBe(true);
    expect(parseReply("/approve", {}).authorized).toBe(false);
  });

  it("matches the configured author list by name, handle or email", () => {
    const config = loadJustinQueueConfig({ replyAuthors: ["justin"] });
    expect(isAuthorizedReplier("Justin", config)).toBe(true);
    expect(isAuthorizedReplier("justin@paperos.dev", config)).toBe(true);
    expect(isAuthorizedReplier("justine", config)).toBe(false);
  });

  it("asks one clarifying question on prose that matches nothing, and acts on none of it", () => {
    const r = parseReply("I had a look at Hetzner last night and it seemed fine overall", JUSTIN);
    expect(r.decisions).toEqual([]);
    expect(r.unparsed).toHaveLength(1);
    expect(r.clarification).toMatch(/could not read a decision/);
  });

  it("takes a reasonless rejection and asks for the reason", () => {
    const r = parseReply("/reject", JUSTIN);
    expect(r.decisions[0]).toMatchObject({ verb: "reject" });
    expect(r.decisions[0]?.reason).toBeUndefined();
    expect(r.clarification).toMatch(/What is the reason/);
  });
});

describe("state change instead of a comment", () => {
  it("treats a move out of Needs Justin as approval of the recommendation", () => {
    expect(decisionFromStateChange("Ready for Claude")).toMatchObject({
      verb: "approve",
      source: "state-change",
    });
  });
  it("treats a move to Backlog or Canceled as a rejection", () => {
    expect(decisionFromStateChange("Backlog")?.verb).toBe("reject");
    expect(decisionFromStateChange("Canceled")?.verb).toBe("reject");
  });
  it("ignores a move that is not a decision", () => {
    expect(decisionFromStateChange("Needs Justin")).toBeUndefined();
  });
});

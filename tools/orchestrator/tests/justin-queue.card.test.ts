import { describe, expect, it } from "vitest";
import { ageHours, isHardBlock, parseCardBlock } from "../src/justin-queue/card.js";
import { renderCard } from "../src/justin-queue/render.js";
import { makeCard } from "./fixtures/justin-card.fixture.js";

describe("decision card schema", () => {
  it("accepts a five-ask batched card", () => {
    expect(makeCard().asks).toHaveLength(4);
  });

  it("refuses a sixth ask: that is a second card", () => {
    const asks = [1, 2, 3, 4, 5, 6].map((n) => ({
      id: `NJ-2.${n}`,
      ask: `ask ${n}`,
      default: "wait",
    }));
    expect(() => makeCard({ asks })).toThrow();
  });

  it("refuses exactly one option (that is a yes/no card, not a choice)", () => {
    expect(() => makeCard({ options: [{ n: 1, label: "only way", risk: "none" }] })).toThrow(
      /zero options/,
    );
  });

  it("refuses ask ids that do not belong to the card", () => {
    expect(() => makeCard({ asks: [{ id: "NJ-9.1", ask: "stray", default: "wait" }] })).toThrow(
      /prefixed/,
    );
  });

  it("refuses a spend card with no amount", () => {
    expect(() => makeCard({ category: "spend" })).toThrow(/spendUsd/);
  });

  it("refuses a key that is not a slug", () => {
    expect(() => makeCard({ key: "Infra Batch" })).toThrow();
  });

  it("is a hard block when any ask is", () => {
    expect(isHardBlock(makeCard())).toBe(false);
    const card = makeCard();
    const first = card.asks[0];
    if (!first) throw new Error("fixture lost its asks");
    expect(isHardBlock({ ...card, asks: [{ ...first, hardBlock: true }] })).toBe(true);
  });

  it("measures age from openedAt", () => {
    expect(ageHours(makeCard(), new Date("2026-09-19T13:44:05.000Z"))).toBeCloseTo(12, 5);
  });
});

describe("render and read back", () => {
  it("round-trips through the rendered comment", () => {
    const card = makeCard();
    const md = renderCard(card);
    expect(md).toContain("**Needs Justin — NJ-2: Infra batch**");
    expect(md).toContain("`NJ-2.2` Registrar or Cloudflare token — default: accept sslip.io");
    expect(md).toContain("2. Hetzner cpx41 + sslip.io — $32;");
    expect(md).toContain("/reject <reason>");
    expect(parseCardBlock(md)).toEqual(card);
  });

  it("marks a hard block in the default line", () => {
    const md = renderCard(makeCard({ hardBlock: true }));
    expect(md).toContain("hard block: this never applies by itself");
  });

  it("returns undefined for a comment with no card block", () => {
    expect(parseCardBlock("**Needs Justin — NJ-2.** Reply /approve.")).toBeUndefined();
  });

  it("returns undefined for a block that is not a valid card", () => {
    expect(parseCardBlock('```paperos-card\n{"key":"x"}\n```')).toBeUndefined();
  });
});

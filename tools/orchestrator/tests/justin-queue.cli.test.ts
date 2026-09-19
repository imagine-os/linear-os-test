import { describe, expect, it } from "vitest";
import { checkRows, formatTable, rowsFrom } from "../src/cli/justin-queue.js";
import { DEFAULT_JUSTIN_QUEUE_CONFIG } from "../src/justin-queue/config.js";
import { renderCard } from "../src/justin-queue/render.js";
import { makeCard } from "./fixtures/justin-card.fixture.js";

const NOW = new Date("2026-09-19T12:00:00.000Z");

function issue(over: Record<string, unknown> = {}) {
  return {
    identifier: "PAP-25",
    title: "Provision the Hetzner VPS",
    priority: 1,
    updatedAt: "2026-09-19T01:44:05.000Z",
    description: null,
    labels: { nodes: [] },
    comments: { nodes: [] },
    ...over,
  } as Parameters<typeof rowsFrom>[0][number];
}

describe("justin-queue list", () => {
  it("parses a rendered card out of a comment", () => {
    const rows = rowsFrom(
      [
        issue({
          comments: {
            nodes: [
              {
                body: renderCard(makeCard()),
                createdAt: "2026-09-19T01:44:05.000Z",
                user: { name: "Atlas" },
              },
            ],
          },
        }),
      ],
      NOW,
    );
    expect(rows[0]).toMatchObject({
      issue: "PAP-25",
      nj: "NJ-2",
      kind: "card",
      key: "infra-batch",
      totalAsks: 4,
      overdue: false,
    });
    expect(rows[0]?.openAsks).toEqual(["NJ-2.1", "NJ-2.2", "NJ-2.3", "NJ-2.4"]);
    expect(rows[0]?.ageHours).toBeCloseTo(10.27, 1);
  });

  it("falls back to a prose card and warns about it (the live PAP-25 shape)", () => {
    const rows = rowsFrom(
      [
        issue({
          comments: {
            nodes: [
              {
                body: "**Needs Justin — NJ-2: Infra batch.** Reply `/approve` with the credentials route.",
                createdAt: "2026-09-19T01:44:05.000Z",
                user: { name: "Justin Massion" },
              },
            ],
          },
        }),
      ],
      NOW,
    );
    expect(rows[0]).toMatchObject({ kind: "legacy", nj: "NJ-2" });
    expect(checkRows(rows).warnings[0]).toMatch(/no paperos-card block/);
    expect(checkRows(rows).errors).toEqual([]);
  });

  it("reads Justin's later reply but only his", () => {
    const rows = rowsFrom(
      [
        issue({
          comments: {
            nodes: [
              {
                body: renderCard(makeCard()),
                createdAt: "2026-09-19T01:44:05.000Z",
                user: { name: "Atlas" },
              },
              {
                body: "/approve option 2",
                createdAt: "2026-09-19T09:00:00.000Z",
                user: { name: "Justin Massion" },
              },
              {
                body: "/reject",
                createdAt: "2026-09-19T09:05:00.000Z",
                user: { name: "Sentinel" },
              },
            ],
          },
        }),
      ],
      NOW,
    );
    expect(rows[0]?.replies).toEqual(["approve #2"]);
  });

  it("errors when the cap is broken or two cards share a key", () => {
    const six = Array.from({ length: 6 }, (_, i) =>
      issue({
        identifier: `PAP-${100 + i}`,
        comments: {
          nodes: [
            {
              body: renderCard(
                makeCard({
                  key: `card-${i}`,
                  nj: `NJ-${i + 1}`,
                  asks: [{ id: `NJ-${i + 1}.1`, ask: "x", default: "d" }],
                }),
              ),
              createdAt: "2026-09-19T00:00:00.000Z",
              user: { name: "Atlas" },
            },
          ],
        },
      }),
    );
    const errors = checkRows(rowsFrom(six, NOW)).errors;
    expect(errors[0]).toMatch(/6 open cards, cap is 5/);

    const twins = [issue({ identifier: "PAP-1" }), issue({ identifier: "PAP-2" })].map((i) => ({
      ...i,
      comments: {
        nodes: [
          {
            body: renderCard(makeCard()),
            createdAt: "2026-09-19T00:00:00.000Z",
            user: { name: "Atlas" },
          },
        ],
      },
    }));
    expect(
      checkRows(rowsFrom(twins, NOW)).errors.some((e) => e.includes('key "infra-batch"')),
    ).toBe(true);
  });

  it("warns once a card is past its window and never for a hard block", () => {
    const late = rowsFrom(
      [
        issue({
          comments: {
            nodes: [{ body: renderCard(makeCard()), createdAt: "x", user: null }],
          },
        }),
      ],
      new Date("2026-09-22T00:00:00.000Z"),
    );
    expect(late[0]?.overdue).toBe(true);
    expect(checkRows(late).warnings.some((w) => w.includes("48 h window"))).toBe(true);

    const hard = rowsFrom(
      [
        issue({
          comments: {
            nodes: [
              { body: renderCard(makeCard({ hardBlock: true })), createdAt: "x", user: null },
            ],
          },
        }),
      ],
      new Date("2026-09-22T00:00:00.000Z"),
    );
    expect(hard[0]?.overdue).toBe(false);
    expect(checkRows(hard).warnings.some((w) => w.includes("nudge Justin"))).toBe(true);
  });

  it("prints a table that names the slot usage", () => {
    const out = formatTable(rowsFrom([issue()], NOW), DEFAULT_JUSTIN_QUEUE_CONFIG);
    expect(out.split("\n")[0]).toBe("Needs Justin: 1 open of 5");
  });
});

import { readFileSync } from "node:fs";
import type { LinearClient } from "@linear/sdk";
import { describe, expect, it, vi } from "vitest";
import { applyDiff } from "../src/linear/apply.js";
import { desiredConfig } from "../src/linear/desired.js";
import { diffLabels, diffTemplates } from "../src/linear/diff.js";

const liveFixture = JSON.parse(
  readFileSync(new URL("./fixtures/live-snapshot.fixture.json", import.meta.url), "utf8"),
);

/** A mock `LinearClient` whose only surface `apply.ts` touches is
 * `client.client.rawRequest`. Records every GraphQL operation name issued
 * so the test can assert the mutation allow-list. */
function mockLinearClient() {
  const calls: { query: string; variables: unknown }[] = [];
  const rawRequest = vi.fn(async (query: string, variables: unknown) => {
    calls.push({ query, variables });
    if (query.includes("issueLabelCreate")) {
      const name = (variables as { input: { name: string } }).input.name;
      return {
        data: { issueLabelCreate: { success: true, issueLabel: { id: `id-${name}`, name } } },
      };
    }
    if (query.includes("issueLabelUpdate")) {
      return { data: { issueLabelUpdate: { success: true } } };
    }
    if (query.includes("templateUpdate")) {
      return { data: { templateUpdate: { success: true } } };
    }
    if (query.includes("workflowStateUpdate")) {
      return { data: { workflowStateUpdate: { success: true } } };
    }
    if (query.includes("teamUpdate")) {
      return { data: { teamUpdate: { success: true } } };
    }
    throw new Error(`mock does not know how to answer: ${query.slice(0, 60)}`);
  });
  const client = { client: { rawRequest } } as unknown as LinearClient;
  return { client, calls };
}

function mutationNameOf(query: string): string {
  const match = query.match(/mutation \w+.*?\{\s*(\w+)\(/s);
  return match?.[1] ?? "unknown";
}

describe("applyDiff — mocked SDK, mutation allow-list", () => {
  it("issues only issueLabelCreate for the Character + round-4 label diff", async () => {
    const rows = diffLabels(liveFixture.labels, desiredConfig().labels);
    const { client, calls } = mockLinearClient();
    const result = await applyDiff(client, liveFixture.team.id, rows, {});

    expect(result.applied).toHaveLength(rows.length);
    expect(result.skippedManual).toHaveLength(0);
    const kinds = new Set(calls.map((c) => mutationNameOf(c.query)));
    expect(kinds).toEqual(new Set(["issueLabelCreate"]));
  });

  it("creates the Character group before its children (parentId always resolves)", async () => {
    const rows = diffLabels(liveFixture.labels, desiredConfig().labels);
    const { client, calls } = mockLinearClient();
    await applyDiff(client, liveFixture.team.id, rows, {});

    const groupCallIndex = calls.findIndex(
      (c) => (c.variables as { input: { name: string } }).input.name === "Character",
    );
    const firstChildIndex = calls.findIndex(
      (c) => (c.variables as { input: { name: string } }).input.name === "Atlas",
    );
    expect(groupCallIndex).toBeGreaterThanOrEqual(0);
    expect(firstChildIndex).toBeGreaterThan(groupCallIndex);
    const childCall = calls[firstChildIndex] as { variables: { input: { parentId?: string } } };
    expect(childCall.variables.input.parentId).toBe("id-Character");
  });

  it("issues only templateUpdate for the PaperOS Spec template diff", async () => {
    const rows = diffTemplates(liveFixture.templates, desiredConfig().templates);
    const { client, calls } = mockLinearClient();
    const result = await applyDiff(client, liveFixture.team.id, rows, {});

    expect(result.applied).toHaveLength(1);
    const kinds = new Set(calls.map((c) => mutationNameOf(c.query)));
    expect(kinds).toEqual(new Set(["templateUpdate"]));
  });

  it("never calls a delete/archive mutation for any row the diff engine can produce", async () => {
    const rows = [
      ...diffLabels(liveFixture.labels, desiredConfig().labels),
      ...diffTemplates(liveFixture.templates, desiredConfig().templates),
    ];
    const { client, calls } = mockLinearClient();
    await applyDiff(client, liveFixture.team.id, rows, {});
    for (const call of calls) {
      expect(call.query).not.toMatch(/delete|archive/i);
    }
  });

  it("skips manual rows without issuing any mutation for them", async () => {
    const manualRow = {
      kind: "template" as const,
      name: "Missing Template",
      field: "exists",
      live: "(none)",
      wanted: "Goal",
      status: "manual" as const,
    };
    const { client, calls } = mockLinearClient();
    const result = await applyDiff(client, liveFixture.team.id, [manualRow], {});
    expect(result.skippedManual).toEqual([manualRow]);
    expect(result.applied).toHaveLength(0);
    expect(calls).toHaveLength(0);
  });
});

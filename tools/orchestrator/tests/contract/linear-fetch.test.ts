import type { LinearClient } from "@linear/sdk";
import { describe, expect, it } from "vitest";
import {
  fetchIssue,
  fetchTeamIssues,
  type LinearIssueNode,
} from "../../src/contract/linear-issue.js";
import { makeLinearOps } from "../../src/webhook/server.js";

function nodeFor(id: number): LinearIssueNode {
  return {
    id: `id-${id}`,
    identifier: `PAP-${id}`,
    title: "t",
    description: "**Goal**\n\ng",
    branchName: `b-${id}`,
    state: { name: "Backlog" },
    project: null,
    parent: null,
    children: { nodes: [] },
    labels: { nodes: [] },
    attachments: { nodes: [] },
    inverseRelations: { nodes: [] },
  };
}

interface Call {
  query: string;
  variables: Record<string, unknown>;
}

/** A LinearClient double: `client.rawRequest` answers from a script and records calls. */
function fakeClient(script: ((call: Call) => { data: unknown; headers?: unknown })[]) {
  const calls: Call[] = [];
  let i = 0;
  const client = {
    client: {
      rawRequest: async (query: string, variables: Record<string, unknown>) => {
        const call = { query, variables };
        calls.push(call);
        const step = script[Math.min(i++, script.length - 1)];
        if (!step) throw new Error("no script step");
        const res = step(call);
        return { data: res.data, headers: res.headers ?? new Headers(), status: 200 };
      },
    },
  } as unknown as LinearClient;
  return { client, calls };
}

describe("fetchTeamIssues", () => {
  it("paginates with first/after, reports complexity per page, and filters by state when given", async () => {
    const { client, calls } = fakeClient([
      () => ({
        data: {
          issues: {
            pageInfo: { hasNextPage: true, endCursor: "c1" },
            nodes: [nodeFor(1), nodeFor(2)],
          },
        },
        headers: new Headers({ "x-complexity": "412" }),
      }),
      () => ({
        data: {
          issues: { pageInfo: { hasNextPage: false, endCursor: null }, nodes: [nodeFor(3)] },
        },
        headers: { "x-complexity": "200" },
      }),
    ]);
    const pages: { page: number; nodes: number; complexity?: number }[] = [];
    const nodes = await fetchTeamIssues(client, {
      pageSize: 2,
      state: "Backlog",
      onPage: (p) => pages.push(p),
    });
    expect(nodes.map((n) => n.identifier)).toEqual(["PAP-1", "PAP-2", "PAP-3"]);
    expect(pages).toEqual([
      { page: 1, nodes: 2, complexity: 412 },
      { page: 2, nodes: 1, complexity: 200 },
    ]);
    expect(calls[0]?.variables).toEqual({
      teamKey: "PAP",
      first: 2,
      after: null,
      state: "Backlog",
    });
    expect(calls[1]?.variables).toMatchObject({ after: "c1" });
    expect(calls[0]?.query).toContain("state: { name: { eq: $state } }");
  });

  it("uses the unfiltered query without a state and tolerates missing complexity headers", async () => {
    const { client, calls } = fakeClient([
      () => ({
        data: {
          issues: { pageInfo: { hasNextPage: false, endCursor: null }, nodes: [nodeFor(9)] },
        },
        headers: {},
      }),
    ]);
    const pages: { complexity?: number }[] = [];
    const nodes = await fetchTeamIssues(client, { onPage: (p) => pages.push(p) });
    expect(nodes).toHaveLength(1);
    expect(pages[0]?.complexity).toBeUndefined();
    expect(calls[0]?.query).not.toContain("$state");
    expect(calls[0]?.variables).toEqual({ teamKey: "PAP", first: 100, after: null });
  });

  it("throws when Linear returns no data, and fetchIssue throws on an unknown issue", async () => {
    const empty = fakeClient([() => ({ data: undefined })]);
    await expect(fetchTeamIssues(empty.client)).rejects.toThrow(/no data/);
    const missing = fakeClient([() => ({ data: { issue: null } })]);
    await expect(fetchIssue(missing.client, "PAP-0")).rejects.toThrow(/not found/);
    const found = fakeClient([() => ({ data: { issue: nodeFor(5) } })]);
    expect((await fetchIssue(found.client, "PAP-5")).identifier).toBe("PAP-5");
  });
});

describe("makeLinearOps", () => {
  it("issues the expected mutations and maps fetched issues and dependents", async () => {
    const { client, calls } = fakeClient([
      (c) => {
        if (c.query.includes("issueUpdate")) return { data: { issueUpdate: { success: true } } };
        if (c.query.includes("issueAddLabel"))
          return { data: { issueAddLabel: { success: true } } };
        if (c.query.includes("commentCreate"))
          return { data: { commentCreate: { success: true } } };
        if (c.query.includes("relations {"))
          return {
            data: {
              issue: {
                relations: {
                  nodes: [
                    { type: "blocks", relatedIssue: { id: "id-7" } },
                    { type: "related", relatedIssue: { id: "id-8" } },
                  ],
                },
              },
            },
          };
        return { data: { issue: nodeFor(7) } };
      },
    ]);
    const ops = makeLinearOps(client);
    const issue = await ops.fetchIssue("id-7");
    expect(issue).toMatchObject({ identifier: "PAP-7", branchName: "b-7" });
    await ops.moveToState("id-7", "st");
    await ops.addLabel("id-7", "lb");
    await ops.comment("id-7", "hello");
    const deps = await ops.fetchDependents?.("id-1");
    expect(deps?.map((d) => d.identifier)).toEqual(["PAP-7"]);
    expect(calls.map((c) => c.variables)).toContainEqual({ id: "id-7", stateId: "st" });
    expect(calls.map((c) => c.variables)).toContainEqual({ id: "id-7", labelId: "lb" });
    expect(calls.map((c) => c.variables)).toContainEqual({ id: "id-7", body: "hello" });
  });
});

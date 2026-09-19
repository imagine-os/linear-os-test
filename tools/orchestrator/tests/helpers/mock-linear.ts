/**
 * A mocked Linear for the PAP-281 tests: an in-memory issue store behind the
 * one method `rawRequestWithRetry` actually calls (`client.client.rawRequest`).
 *
 * It is deliberately dumb — it matches on the operation in the query and
 * mutates the store — because the point of these tests is the claim
 * handshake, not GraphQL parsing. `beforeIssueUpdate` is the hook the
 * concurrency and guard tests use to make Linear move under the loop's feet.
 */

import type { LinearClient } from "@linear/sdk";
import type { IssueNode } from "../../src/linear/issues.js";

export interface MockCall {
  operation: string;
  variables: Record<string, unknown>;
}

export interface MockLinearOptions {
  issues: IssueNode[];
  /** Runs before an issueUpdate is applied; mutate the store here. */
  beforeIssueUpdate?: (id: string, input: Record<string, unknown>, mock: MockLinear) => void;
  /** Fail the first N calls with a RATELIMITED error. */
  rateLimitFirst?: number;
  /** Throw this on every call (Linear down). */
  fail?: Error;
}

export class MockLinear {
  readonly calls: MockCall[] = [];
  readonly comments: { issueId: string; body: string }[] = [];
  readonly labelsCreated: string[] = [];
  readonly attachments: { issueId: string; url: string }[] = [];
  private issues: Map<string, IssueNode>;
  private rateLimitLeft: number;

  constructor(private readonly opts: MockLinearOptions) {
    this.issues = new Map(opts.issues.map((i) => [i.id, structuredClone(i)]));
    this.rateLimitLeft = opts.rateLimitFirst ?? 0;
  }

  get(idOrIdentifier: string): IssueNode | undefined {
    const byId = this.issues.get(idOrIdentifier);
    if (byId) return byId;
    for (const issue of this.issues.values()) {
      if (issue.identifier === idOrIdentifier) return issue;
    }
    return undefined;
  }

  set(issue: IssueNode): void {
    this.issues.set(issue.id, issue);
  }

  list(): IssueNode[] {
    return [...this.issues.values()];
  }

  countCalls(operation: string): number {
    return this.calls.filter((c) => c.operation === operation).length;
  }

  /** Cast to `LinearClient`: only `client.rawRequest` is ever touched. */
  asClient(): LinearClient {
    return {
      client: {
        rawRequest: async (query: string, variables: Record<string, unknown>) => ({
          data: this.handle(query, variables),
        }),
      },
    } as unknown as LinearClient;
  }

  private handle(query: string, variables: Record<string, unknown>): unknown {
    if (this.opts.fail) throw this.opts.fail;
    if (this.rateLimitLeft > 0) {
      this.rateLimitLeft -= 1;
      throw new Error("RATELIMITED: too many requests");
    }
    const operation = /(?:query|mutation)\s+(\w+)/.exec(query)?.[1] ?? "unknown";
    this.calls.push({ operation, variables });

    if (query.includes("issues(")) {
      const state = String(variables.state ?? "Ready for Claude");
      const nodes = this.list().filter(
        (i) =>
          i.state.name === state &&
          !i.assignee &&
          !i.labels.nodes.some((l) => l.name === "Deferred"),
      );
      return { issues: { nodes, pageInfo: { hasNextPage: false, endCursor: null } } };
    }
    if (query.includes("issue(id: $id)")) {
      return { issue: this.get(String(variables.id)) ?? null };
    }
    if (query.includes("issueUpdate(")) {
      const id = String(variables.id);
      const input = (variables.input ?? {}) as Record<string, unknown>;
      this.opts.beforeIssueUpdate?.(id, input, this);
      const issue = this.get(id);
      if (!issue) return { issueUpdate: { success: false } };
      if (typeof input.stateId === "string") {
        issue.state = { id: input.stateId, name: stateName(input.stateId), type: "started" };
      }
      if ("assigneeId" in input) {
        issue.assignee =
          input.assigneeId === null ? null : { id: String(input.assigneeId), name: "bot" };
      }
      issue.updatedAt = new Date(Date.parse(issue.updatedAt) + 1000).toISOString();
      return { issueUpdate: { success: true, issue } };
    }
    if (query.includes("commentCreate(")) {
      this.comments.push({ issueId: String(variables.issueId), body: String(variables.body) });
      return { commentCreate: { success: true, comment: { id: `c${this.comments.length}` } } };
    }
    if (query.includes("attachmentLinkURL(")) {
      this.attachments.push({ issueId: String(variables.issueId), url: String(variables.url) });
      return { attachmentLinkURL: { success: true, attachment: { id: "a1" } } };
    }
    if (query.includes("issueLabelCreate(")) {
      this.labelsCreated.push(String(variables.name));
      return {
        issueLabelCreate: {
          success: true,
          issueLabel: { id: `l${this.labelsCreated.length}`, name: String(variables.name) },
        },
      };
    }
    throw new Error(`MockLinear: unhandled operation ${operation}`);
  }
}

const STATE_IDS: Record<string, string> = {
  "state-ready": "Ready for Claude",
  "state-progress": "In Progress",
  "state-review": "In Review",
  "state-justin": "Needs Justin",
  "state-backlog": "Backlog",
  "state-done": "Done",
};

function stateName(id: string): string {
  return STATE_IDS[id] ?? id;
}

export const TEST_IDS = {
  version: 1 as const,
  generatedAt: "2026-09-19T00:00:00.000Z",
  team: { id: "team-pap", key: "PAP", name: "PaperOS" },
  states: {
    Backlog: "state-backlog",
    "Ready for Claude": "state-ready",
    "In Progress": "state-progress",
    "In Review": "state-review",
    "Needs Justin": "state-justin",
    Done: "state-done",
  } as Record<string, string>,
  labels: { "Character/Atlas": "label-atlas", Deferred: "label-deferred" } as Record<
    string,
    string
  >,
  templates: {} as Record<string, string>,
  projects: {} as Record<string, string>,
  cycles: {} as Record<string, string>,
  teamSettings: { issueEstimationType: "fibonacci", cyclesEnabled: true, triageEnabled: true },
};

let counter = 0;

/** A minimal `Ready for Claude` issue; override anything through `patch`. */
export function makeIssue(patch: Partial<IssueNode> = {}): IssueNode {
  counter += 1;
  const n = counter;
  return {
    id: `u-${n}`,
    identifier: `PAP-${n}`,
    title: `Test issue ${n}`,
    priority: 2,
    createdAt: new Date(Date.UTC(2026, 8, 1, 0, 0, n)).toISOString(),
    updatedAt: new Date(Date.UTC(2026, 8, 10, 0, 0, n)).toISOString(),
    branchName: `feat/PAP-${n}`,
    state: { id: "state-ready", name: "Ready for Claude", type: "unstarted" },
    assignee: null,
    labels: { nodes: [] },
    children: { nodes: [] },
    inverseRelations: { nodes: [] },
    ...patch,
  };
}

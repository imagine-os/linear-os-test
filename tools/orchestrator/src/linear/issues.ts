/**
 * Reading issues from Linear for the claim loop (PAP-281).
 *
 * One GraphQL document per question, all through `rawRequestWithRetry` so the
 * `RATELIMITED` back-off in `client.ts` applies everywhere. The node shape is
 * deliberately the same subset PAP-93's `LinearIssueNode` reads (labels,
 * children, inverseRelations, attachments), so an issue fetched here can be
 * handed to `validateIssue()` without a second round trip once PAP-93 is on
 * main.
 */

import type { LinearClient } from "@linear/sdk";
import { rawRequestWithRetry } from "./client.js";

export interface IssueLabelNode {
  name: string;
  parent?: { name: string } | null;
}

export interface IssueStateNode {
  id: string;
  name: string;
  type: string;
}

export interface RelatedIssueNode {
  id: string;
  identifier: string;
  state: IssueStateNode;
  branchName?: string | null;
  attachments?: { nodes: { url: string; title?: string | null }[] };
}

export interface IssueNode {
  id: string;
  identifier: string;
  title: string;
  /** Markdown description; read by the deferral-note check and by PAP-93. */
  description?: string | null;
  /** Linear priority: 0 = none, 1 = urgent … 4 = low. */
  priority: number;
  createdAt: string;
  updatedAt: string;
  branchName?: string | null;
  url?: string;
  state: IssueStateNode;
  assignee?: { id: string; name: string } | null;
  parent?: { id: string; identifier: string } | null;
  project?: { id: string; name: string } | null;
  labels: { nodes: IssueLabelNode[] };
  children: { nodes: { id: string; identifier: string }[] };
  /** Inbound relations: `inverseRelations(type: "blocks")` are the blockers. */
  inverseRelations?: { nodes: { type: string; issue: RelatedIssueNode }[] };
}

export const ISSUE_FIELDS = /* GraphQL */ `
  fragment OrchestratorIssue on Issue {
    id
    identifier
    title
    description
    priority
    createdAt
    updatedAt
    branchName
    url
    state { id name type }
    assignee { id name }
    parent { id identifier }
    project { id name }
    labels(first: 50) { nodes { name parent { name } } }
    children(first: 50) { nodes { id identifier } }
    inverseRelations(first: 50) {
      nodes {
        type
        issue {
          id
          identifier
          branchName
          state { id name type }
          attachments(first: 20) { nodes { url title } }
        }
      }
    }
  }
`;

const READY_QUERY = /* GraphQL */ `
  ${ISSUE_FIELDS}
  query ReadyForClaude($team: String!, $state: String!, $first: Int!, $after: String) {
    issues(
      first: $first
      after: $after
      orderBy: createdAt
      filter: {
        team: { key: { eq: $team } }
        state: { name: { eq: $state } }
        assignee: { null: true }
        labels: { every: { name: { neq: "Deferred" } } }
      }
    ) {
      nodes { ...OrchestratorIssue }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const ONE_ISSUE_QUERY = /* GraphQL */ `
  ${ISSUE_FIELDS}
  query OneIssue($id: String!) {
    issue(id: $id) { ...OrchestratorIssue }
  }
`;

export const READY_STATE = "Ready for Claude";

interface IssueConnection {
  issues: { nodes: IssueNode[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } };
}

/**
 * Every unassigned `Ready for Claude` issue on the team, paged.
 *
 * The `Deferred` exclusion is in the server-side filter (PAP-96 Spec, "Claim
 * filter"). It is not trusted on its own: `filters.isDeferred()` re-checks the
 * fetched labels before the claim is written, because a label added between
 * poll and claim is not caught by the `updatedAt` guard alone (PAP-96 edge
 * case "Label added after fetch").
 */
export async function fetchReadyIssues(
  client: LinearClient,
  team: string,
  opts: { pageSize?: number; maxPages?: number } = {},
): Promise<IssueNode[]> {
  const pageSize = opts.pageSize ?? 50;
  const maxPages = opts.maxPages ?? 10;
  const out: IssueNode[] = [];
  let after: string | null = null;
  for (let page = 0; page < maxPages; page++) {
    const data: IssueConnection = await rawRequestWithRetry<IssueConnection>(client, READY_QUERY, {
      team,
      state: READY_STATE,
      first: pageSize,
      after,
    });
    out.push(...data.issues.nodes);
    if (!data.issues.pageInfo.hasNextPage) break;
    after = data.issues.pageInfo.endCursor;
    if (after === null) break;
  }
  return out;
}

/** One issue by identifier (`PAP-281`) or UUID. Used by the pre-claim re-check. */
export async function fetchIssue(client: LinearClient, id: string): Promise<IssueNode | undefined> {
  const data = await rawRequestWithRetry<{ issue: IssueNode | null }>(client, ONE_ISSUE_QUERY, {
    id,
  });
  return data.issue ?? undefined;
}

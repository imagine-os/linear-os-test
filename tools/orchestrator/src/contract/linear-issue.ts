/**
 * Linear GraphQL -> `ContractIssue` (PAP-93). The one query the audit CLI and
 * the webhook handler use to fetch an issue with everything the validator
 * needs, and the pure mapping from a node to the validator's input.
 *
 * Complexity: one 100-issue page of ISSUE_FIELDS measured ~830 against
 * Linear's 10,000 per-query budget (2026-09-19; 1005 issues = 11 requests,
 * 4.5k total). Keep nested connections shallow; do not add `comments`.
 */

import type { LinearClient } from "@linear/sdk";
import { rawRequestWithRetry } from "../linear/client.js";
import type { AttachmentRef, Blocker, ContractIssue, IssueLabel, PullRequestRef } from "./types.js";

export const ISSUE_FIELDS = /* GraphQL */ `
  id
  identifier
  title
  description
  branchName
  updatedAt
  state { name type }
  project { id name }
  parent { id identifier description }
  children { nodes { id identifier state { name type } } }
  labels { nodes { id name parent { name } } }
  attachments { nodes { url title sourceType } }
  inverseRelations {
    nodes {
      type
      issue { identifier branchName state { name type } attachments { nodes { url sourceType } } }
    }
  }
`;

export const TEAM_ISSUES_QUERY = /* GraphQL */ `
  query ContractTeamIssues($teamKey: String!, $after: String, $first: Int!, $state: String) {
    issues(
      first: $first
      after: $after
      filter: { team: { key: { eq: $teamKey } }, state: { name: { eq: $state } } }
    ) {
      pageInfo { hasNextPage endCursor }
      nodes { ${ISSUE_FIELDS} }
    }
  }
`;

export const TEAM_ISSUES_ALL_QUERY = TEAM_ISSUES_QUERY.replace(
  ", state: { name: { eq: $state } }",
  "",
).replace(", $state: String", "");

export const ISSUE_QUERY = /* GraphQL */ `
  query ContractIssue($id: String!) { issue(id: $id) { ${ISSUE_FIELDS} } }
`;

/** Shape of one node returned by ISSUE_FIELDS. */
export interface LinearIssueNode {
  id: string;
  identifier: string;
  title: string;
  description: string | null;
  branchName?: string | null;
  updatedAt?: string;
  state: { name: string; type?: string | null };
  project: { id: string; name: string } | null;
  parent: { id: string; identifier: string; description?: string | null } | null;
  children: {
    nodes: { id: string; identifier: string; state: { name: string; type?: string | null } }[];
  };
  labels: { nodes: { id: string; name: string; parent?: { name: string } | null }[] };
  attachments: { nodes: { url: string; title?: string | null; sourceType?: string | null }[] };
  inverseRelations: {
    nodes: {
      type: string;
      issue: {
        identifier: string;
        branchName?: string | null;
        state: { name: string; type?: string | null };
        attachments?: { nodes: { url: string; sourceType?: string | null }[] };
      };
    }[];
  };
}

export interface ToContractIssueOptions {
  /** pr-flow mode hook: an open PR for a blocker's branch (`gh pr list --head <branch>` equivalent). */
  prForBranch?: (branch: string) => PullRequestRef | undefined;
  claimTarget?: boolean;
}

const PR_URL_RE = /github\.com\/[^/\s]+\/[^/\s]+\/pull\/\d+/i;

/** A PR attachment on a blocker counts as its open PR (Linear removes/marks merged ones; we only see presence). */
export function prFromAttachments(
  attachments: { url: string; sourceType?: string | null }[] | undefined,
): PullRequestRef | undefined {
  const a = (attachments ?? []).find(
    (x) => PR_URL_RE.test(x.url) || (x.sourceType ?? "").toLowerCase() === "github",
  );
  return a ? { url: a.url, open: true } : undefined;
}

export function toContractIssue(
  node: LinearIssueNode,
  opts: ToContractIssueOptions = {},
): ContractIssue {
  const labels: IssueLabel[] = node.labels.nodes.map((l) => ({
    name: l.name,
    group: l.parent?.name ?? null,
  }));
  const attachments: AttachmentRef[] = node.attachments.nodes.map((a) => ({
    url: a.url,
    title: a.title ?? null,
    sourceType: a.sourceType ?? null,
  }));
  const blockedBy: Blocker[] = node.inverseRelations.nodes
    .filter((r) => r.type === "blocks")
    .map((r) => {
      const b = r.issue;
      const pr =
        prFromAttachments(b.attachments?.nodes) ??
        (b.branchName && opts.prForBranch ? opts.prForBranch(b.branchName) : undefined) ??
        null;
      return { identifier: b.identifier, state: b.state, branch: b.branchName ?? null, pr };
    });
  const issue: ContractIssue = {
    id: node.id,
    identifier: node.identifier,
    title: node.title,
    description: node.description,
    state: node.state,
    labels,
    project: node.project,
    parent: node.parent
      ? { identifier: node.parent.identifier, description: node.parent.description ?? null }
      : null,
    children: node.children.nodes.map((c) => ({ identifier: c.identifier, state: c.state })),
    blockedBy,
    attachments,
  };
  if (opts.claimTarget) issue.claimTarget = true;
  return issue;
}

export interface FetchTeamIssuesOptions {
  teamKey?: string;
  state?: string;
  pageSize?: number;
  /** Called after every page with Linear's reported complexity (from the `X-Complexity` header when present). */
  onPage?: (info: { page: number; nodes: number; complexity?: number }) => void;
}

/** Every issue of a team (optionally one state), paginated; read-only. */
export async function fetchTeamIssues(
  client: LinearClient,
  opts: FetchTeamIssuesOptions = {},
): Promise<LinearIssueNode[]> {
  const teamKey = opts.teamKey ?? "PAP";
  const first = opts.pageSize ?? 100;
  const nodes: LinearIssueNode[] = [];
  let after: string | null = null;
  let page = 0;
  for (;;) {
    page++;
    const variables: Record<string, unknown> = { teamKey, first, after };
    if (opts.state) variables.state = opts.state;
    const res = await client.client.rawRequest<
      {
        issues: {
          pageInfo: { hasNextPage: boolean; endCursor: string | null };
          nodes: LinearIssueNode[];
        };
      },
      Record<string, unknown>
    >(opts.state ? TEAM_ISSUES_QUERY : TEAM_ISSUES_ALL_QUERY, variables);
    const data = res.data;
    if (!data) throw new Error("Linear returned no data for the team issues query");
    nodes.push(...data.issues.nodes);
    const complexityHeader = headerValue(res.headers, "x-complexity");
    opts.onPage?.({
      page,
      nodes: data.issues.nodes.length,
      complexity: complexityHeader ? Number(complexityHeader) : undefined,
    });
    if (!data.issues.pageInfo.hasNextPage) break;
    after = data.issues.pageInfo.endCursor;
  }
  return nodes;
}

function headerValue(headers: unknown, name: string): string | undefined {
  const h = headers as { get?: (n: string) => string | null } | Record<string, string> | undefined;
  if (!h) return undefined;
  if (typeof (h as { get?: unknown }).get === "function") {
    return (h as { get: (n: string) => string | null }).get(name) ?? undefined;
  }
  const rec = h as Record<string, string>;
  return rec[name] ?? rec[name.toLowerCase()];
}

/** One issue by id or identifier (`PAP-93`). */
export async function fetchIssue(
  client: LinearClient,
  idOrIdentifier: string,
): Promise<LinearIssueNode> {
  const data = await rawRequestWithRetry<{ issue: LinearIssueNode | null }>(client, ISSUE_QUERY, {
    id: idOrIdentifier,
  });
  if (!data.issue) throw new Error(`issue ${idOrIdentifier} not found`);
  return data.issue;
}

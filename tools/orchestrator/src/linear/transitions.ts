/**
 * State transitions (PAP-281). The only moves the orchestrator makes are
 * `Ready for Claude → In Progress` (in `claim.ts`), `In Progress → In Review`,
 * `In Progress → Ready for Claude` (retry) and `→ Needs Justin` (escalate).
 *
 * There is deliberately no `toDone()`. In build-loop mode the review pass
 * moves an issue to Done (playbook §8) and the security deny list forbids the
 * loop from doing it; adding one here would be the bug, not the feature.
 *
 * Build-loop adaptation: `toInReview()` takes an `evidence` string instead of
 * requiring a PR URL. In `pr-flow` mode a PR URL is required and is attached
 * with `attachmentLinkURL`; in `build-loop` mode the commit SHAs pushed to
 * main are the evidence and no attachment is created.
 */

import type { LinearClient } from "@linear/sdk";
import type { SessionFooter } from "../agents/session-footer.js";
import type { Mode } from "../config.js";
import type { OrchestratorDb } from "../db/index.js";
import type { EventBus } from "../events.js";
import { rawRequestWithRetry } from "./client.js";
import { linearComment } from "./comment.js";
import type { WorkspaceIds } from "./workspace.js";
import { requireState } from "./workspace.js";

const ISSUE_UPDATE = /* GraphQL */ `
  mutation OrchestratorIssueUpdate($id: String!, $input: IssueUpdateInput!) {
    issueUpdate(id: $id, input: $input) {
      success
      issue { id identifier updatedAt state { id name } assignee { id } }
    }
  }
`;

const ATTACHMENT_LINK = /* GraphQL */ `
  mutation OrchestratorAttach($issueId: String!, $url: String!, $title: String!) {
    attachmentLinkURL(issueId: $issueId, url: $url, title: $title) {
      success
      attachment { id }
    }
  }
`;

const LABEL_CREATE = /* GraphQL */ `
  mutation OrchestratorLabel($teamId: String!, $name: String!) {
    issueLabelCreate(input: { teamId: $teamId, name: $name }) {
      success
      issueLabel { id name }
    }
  }
`;

export interface TransitionDeps {
  client: LinearClient;
  db: OrchestratorDb;
  ids: WorkspaceIds;
  events: EventBus;
  mode: Mode;
  maxRetries: number;
  dryRun?: boolean;
  log?: (message: string) => void;
}

export interface IssueRef {
  id: string;
  identifier: string;
}

export interface TransitionResult {
  ok: boolean;
  state: string;
  /** Set when the move was refused rather than attempted. */
  reason?: string;
}

async function setState(
  deps: TransitionDeps,
  issue: IssueRef,
  stateName: string,
  extra: Record<string, unknown> = {},
): Promise<{ updatedAt?: string }> {
  if (deps.dryRun) {
    deps.log?.(`transition: dry run, would move ${issue.identifier} to ${stateName}`);
    return {};
  }
  const data = await rawRequestWithRetry<{
    issueUpdate: { success: boolean; issue?: { updatedAt: string } };
  }>(deps.client, ISSUE_UPDATE, {
    id: issue.id,
    input: { stateId: requireState(deps.ids, stateName), ...extra },
  });
  if (!data.issueUpdate.success) {
    throw new Error(`issueUpdate to "${stateName}" failed for ${issue.identifier}`);
  }
  return { updatedAt: data.issueUpdate.issue?.updatedAt };
}

/**
 * `In Progress → In Review`. In `pr-flow` mode `evidence` must be a PR URL and
 * is attached to the issue; in `build-loop` mode it is the free-text evidence
 * line the `Session ended` comment carries (commits on main).
 */
export async function toInReview(
  deps: TransitionDeps,
  issue: IssueRef,
  evidence: string,
  footer?: SessionFooter,
): Promise<TransitionResult> {
  if (deps.mode === "pr-flow") {
    if (!/^https?:\/\//.test(evidence)) {
      return { ok: false, state: "In Progress", reason: "pr-flow requires a PR URL" };
    }
    if (!deps.dryRun) {
      await rawRequestWithRetry(deps.client, ATTACHMENT_LINK, {
        issueId: issue.id,
        url: evidence,
        title: `PR for ${issue.identifier}`,
      });
    }
    deps.events.emit("pr.detected", {
      issueId: issue.id,
      identifier: issue.identifier,
      url: evidence,
    });
  }
  await setState(deps, issue, "In Review");
  deps.db.deleteClaim(issue.id);
  deps.events.emit("issue.in_review", {
    issueId: issue.id,
    identifier: issue.identifier,
    evidence,
  });
  if (footer) {
    await linearComment(
      { client: deps.client, db: deps.db, dryRun: deps.dryRun, log: deps.log },
      issue.id,
      deps.mode === "pr-flow"
        ? `**Session ended** — PR ${evidence}.`
        : `**Session ended** — ${evidence}.`,
      footer,
    );
  }
  return { ok: true, state: "In Review" };
}

/**
 * Re-queue a session that ended with nothing to show: back to
 * `Ready for Claude` with a `retry-<n>` label, capped at `maxRetries`, after
 * which the issue is escalated instead (PAP-281 Spec).
 */
export async function retry(
  deps: TransitionDeps,
  issue: IssueRef,
  reason: string,
): Promise<TransitionResult> {
  const attempt = deps.db.bumpRetry(issue.id);
  if (attempt > deps.maxRetries) {
    return escalate(deps, issue, `${reason} (retry cap ${deps.maxRetries} reached)`);
  }
  const labelId = await ensureRetryLabel(deps, attempt);
  await setState(deps, issue, "Ready for Claude", {
    assigneeId: null,
    ...(labelId ? { addedLabelIds: [labelId] } : {}),
  });
  deps.db.deleteClaim(issue.id);
  deps.events.emit("issue.retried", {
    issueId: issue.id,
    identifier: issue.identifier,
    attempt,
  });
  return { ok: true, state: "Ready for Claude" };
}

/**
 * Route to `Needs Justin` with a PAP-94 card body. The loop never decides what
 * Justin should do — it states what happened and stops touching the issue.
 */
export async function escalate(
  deps: TransitionDeps,
  issue: IssueRef,
  reason: string,
  footer?: SessionFooter,
): Promise<TransitionResult> {
  await setState(deps, issue, "Needs Justin");
  deps.db.deleteClaim(issue.id);
  deps.events.emit("issue.escalated", {
    issueId: issue.id,
    identifier: issue.identifier,
    reason,
  });
  await linearComment(
    { client: deps.client, db: deps.db, dryRun: deps.dryRun, log: deps.log },
    issue.id,
    [
      "**Needs Justin** — the orchestrator could not finish this issue automatically.",
      "",
      `**What happened:** ${reason}`,
      "**Decision needed:** re-queue this issue (comment `/approve`) or take it off the loop (comment `/reject`).",
      "**Default if no answer:** the issue stays in Needs Justin and nothing else waits on it.",
    ].join("\n"),
    footer,
  );
  return { ok: true, state: "Needs Justin" };
}

/** `retry-1`, `retry-2` … created on the team the first time they are needed. */
async function ensureRetryLabel(deps: TransitionDeps, attempt: number): Promise<string | null> {
  const name = `retry-${attempt}`;
  const known = deps.ids.labels[name];
  if (known) return known;
  if (deps.dryRun) return null;
  try {
    const data = await rawRequestWithRetry<{
      issueLabelCreate: { success: boolean; issueLabel?: { id: string } };
    }>(deps.client, LABEL_CREATE, { teamId: deps.ids.team.id, name });
    const id = data.issueLabelCreate.issueLabel?.id ?? null;
    if (id) deps.ids.labels[name] = id;
    return id;
  } catch (err) {
    // A label is bookkeeping, not correctness: warn and re-queue anyway.
    deps.log?.(`transition: could not create label "${name}": ${(err as Error).message}`);
    return null;
  }
}

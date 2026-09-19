/**
 * Linear webhook handler for the issue contract (PAP-93).
 *
 * On `Issue` `update` into `Ready for Claude`: validate; errors move the
 * issue to `Backlog`, add `needs-contract` (shape errors only; an umbrella or
 * a blocked issue is well-formed, just unclaimable) and post the violations
 * comment; warnings comment only; a clean issue gets silence. Idempotent by
 * `webhookId`. Ignores its own actor ids. If the last actor is Justin, it
 * comments but never moves. A blocker regressing from a closed state to an
 * open one re-validates every Ready dependent (READY_BUT_BLOCKED bounce).
 *
 * Everything that touches Linear or the clock is injected (`WebhookDeps`), so
 * the 30-payload replay test runs with no network.
 */

import type { ContractConfig } from "../contract/config.js";
import { isOpen } from "../contract/open.js";
import { renderViolationsComment } from "../contract/render.js";
import type { ContractCheckStore } from "../contract/store.js";
import type { ContractIssue, ViolationCode } from "../contract/types.js";
import { errorCodes, validateIssue } from "../contract/validate.js";

/** The subset of Linear's webhook envelope the handler reads. */
export interface LinearWebhookPayload {
  action: "create" | "update" | "remove" | string;
  type: "Issue" | "Comment" | "IssueLabel" | string;
  webhookId?: string;
  webhookTimestamp?: number;
  createdAt?: string;
  actor?: { id?: string; name?: string; type?: string } | null;
  data: {
    id: string;
    identifier?: string;
    stateId?: string;
    state?: { id?: string; name?: string };
    branchName?: string;
    [k: string]: unknown;
  };
  updatedFrom?: { stateId?: string; [k: string]: unknown } | null;
}

export interface LinearOps {
  fetchIssue(id: string): Promise<ContractIssue & { branchName?: string | null }>;
  moveToState(issueId: string, stateId: string): Promise<void>;
  addLabel(issueId: string, labelId: string): Promise<void>;
  comment(issueId: string, body: string): Promise<void>;
  /** Issues that this issue blocks (outbound `blocks`), for blocker-regression re-validation. */
  fetchDependents?(issueId: string): Promise<(ContractIssue & { branchName?: string | null })[]>;
}

export interface WebhookDeps {
  store: ContractCheckStore;
  linear: LinearOps;
  ids: {
    readyStateId: string;
    backlogStateId: string;
    /** Absent until PAP-91's desired config gains `needs-contract`; the label step is then skipped and logged. */
    needsContractLabelId?: string;
    stateNamesById?: Record<string, string>;
  };
  actors: {
    /** Actor ids whose moves are ignored (this validator, the orchestrator bot). */
    botIds: string[];
    /** Justin's user id: comment, never move. */
    justinId?: string;
  };
  config?: Partial<ContractConfig>;
  log?: (event: string, detail?: Record<string, unknown>) => void;
  now?: () => Date;
}

export type WebhookOutcome =
  | { kind: "ignored"; reason: string }
  | { kind: "duplicate"; webhookId: string }
  | { kind: "passed"; issue: string }
  | { kind: "warned"; issue: string; codes: string[] }
  | { kind: "bounced"; issue: string; codes: string[]; labelled: boolean }
  | { kind: "commented"; issue: string; codes: string[]; reason: "justin" }
  | { kind: "revalidated"; blocker: string; bounced: string[] };

/** Error codes that do not mean the issue body is malformed (no `needs-contract` label for these). */
const READINESS_CODES: ReadonlySet<ViolationCode> = new Set<ViolationCode>([
  "UMBRELLA_NOT_CLAIMABLE",
  "READY_BUT_BLOCKED",
  "BLOCKED_BY_OPEN",
]);

export async function handleLinearWebhook(
  payload: LinearWebhookPayload,
  deps: WebhookDeps,
): Promise<WebhookOutcome> {
  const log = deps.log ?? (() => {});
  if (payload.type !== "Issue" || payload.action !== "update") {
    return { kind: "ignored", reason: `not an Issue update (${payload.type}.${payload.action})` };
  }
  const webhookId = payload.webhookId ?? `${payload.data.id}:${payload.createdAt ?? ""}`;
  if (!deps.store.firstDelivery(webhookId, deps.now?.())) {
    log("webhook.duplicate", { webhookId });
    return { kind: "duplicate", webhookId };
  }
  const actorId = payload.actor?.id;
  if (actorId && deps.actors.botIds.includes(actorId)) {
    return { kind: "ignored", reason: "own actor" };
  }
  const stateChanged =
    payload.updatedFrom !== undefined &&
    payload.updatedFrom !== null &&
    "stateId" in payload.updatedFrom;
  if (!stateChanged) return { kind: "ignored", reason: "state unchanged" };

  const newStateId = payload.data.stateId ?? payload.data.state?.id;
  const newStateName =
    payload.data.state?.name ?? (newStateId ? deps.ids.stateNamesById?.[newStateId] : undefined);
  const movedToReady = newStateId === deps.ids.readyStateId || newStateName === "Ready for Claude";

  if (!movedToReady) {
    const fromName = payload.updatedFrom?.stateId
      ? deps.ids.stateNamesById?.[payload.updatedFrom.stateId]
      : undefined;
    if (fromName && newStateName && isBlockerRegression(fromName, newStateName, deps)) {
      return revalidateDependents(payload, deps, log);
    }
    return { kind: "ignored", reason: `moved to ${newStateName ?? newStateId ?? "unknown"}` };
  }

  const issue = await deps.linear.fetchIssue(payload.data.id);
  return validateAndAct(issue, deps, actorId, log);
}

async function validateAndAct(
  issue: ContractIssue & { branchName?: string | null },
  deps: WebhookDeps,
  actorId: string | undefined,
  log: NonNullable<WebhookDeps["log"]>,
): Promise<WebhookOutcome> {
  const result = validateIssue(issue, deps.config);
  deps.store.record(issue.id, result, deps.now?.());
  const errors = errorCodes(result);
  if (result.violations.length === 0) {
    log("contract.passed", { issue: issue.identifier });
    return { kind: "passed", issue: issue.identifier };
  }
  const warnOnly = errors.length === 0;
  const justin = actorId !== undefined && actorId === deps.actors.justinId;
  if (warnOnly) {
    await deps.linear.comment(
      issue.id,
      renderViolationsComment(issue, result, {
        outcome: "commented",
        branch: issue.branchName,
        now: deps.now?.(),
      }),
    );
    log("contract.warned", {
      issue: issue.identifier,
      codes: result.violations.map((v) => v.code),
    });
    return { kind: "warned", issue: issue.identifier, codes: result.violations.map((v) => v.code) };
  }
  if (justin) {
    await deps.linear.comment(
      issue.id,
      renderViolationsComment(issue, result, {
        outcome: "commented",
        branch: issue.branchName,
        now: deps.now?.(),
      }),
    );
    log("contract.commented", { issue: issue.identifier, codes: errors, reason: "justin" });
    return { kind: "commented", issue: issue.identifier, codes: errors, reason: "justin" };
  }
  await deps.linear.moveToState(issue.id, deps.ids.backlogStateId);
  const shapeError = errors.some((c) => !READINESS_CODES.has(c as ViolationCode));
  let labelled = false;
  if (shapeError) {
    if (deps.ids.needsContractLabelId) {
      await deps.linear.addLabel(issue.id, deps.ids.needsContractLabelId);
      labelled = true;
    } else {
      log("contract.label_missing", {
        issue: issue.identifier,
        hint: "add `needs-contract` to src/linear/desired.ts and run pnpm linear:configure --apply",
      });
    }
  }
  await deps.linear.comment(
    issue.id,
    renderViolationsComment(issue, result, {
      outcome: "bounced",
      movedTo: "Backlog",
      branch: issue.branchName,
      now: deps.now?.(),
    }),
  );
  log("contract.bounced", { issue: issue.identifier, codes: errors, labelled });
  return { kind: "bounced", issue: issue.identifier, codes: errors, labelled };
}

function isBlockerRegression(fromName: string, toName: string, deps: WebhookDeps): boolean {
  const mode = deps.config?.mode ?? "build-loop";
  const wasClosed = !isOpen({ identifier: "x", state: { name: fromName } }, { mode });
  const nowOpen = isOpen({ identifier: "x", state: { name: toName } }, { mode });
  return wasClosed && nowOpen;
}

async function revalidateDependents(
  payload: LinearWebhookPayload,
  deps: WebhookDeps,
  log: NonNullable<WebhookDeps["log"]>,
): Promise<WebhookOutcome> {
  const blocker = payload.data.identifier ?? payload.data.id;
  if (!deps.linear.fetchDependents) {
    return {
      kind: "ignored",
      reason: `blocker ${blocker} regressed; no dependents lookup configured`,
    };
  }
  const dependents = await deps.linear.fetchDependents(payload.data.id);
  const bounced: string[] = [];
  for (const dep of dependents) {
    if (dep.state.name !== "Ready for Claude") continue;
    const outcome = await validateAndAct(dep, deps, payload.actor?.id, log);
    if (outcome.kind === "bounced" || outcome.kind === "commented") bounced.push(dep.identifier);
  }
  log("contract.revalidated", { blocker, bounced });
  return { kind: "revalidated", blocker, bounced };
}

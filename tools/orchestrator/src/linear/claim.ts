/**
 * `claimNext()` (PAP-281): the atomic claim.
 *
 * The sequence, and why each step is there:
 *
 * 1. **Poll.** `fetchReadyIssues()` asks Linear for unassigned
 *    `Ready for Claude` issues on the team, `Deferred` excluded server-side.
 * 2. **Order.** `orderQueue()` — priority, then age. PAP-99 replaces this by
 *    passing its own `pickNext`.
 * 3. **Filter.** Umbrellas and `Deferred` issues are dropped, and an umbrella
 *    or Deferred issue found sitting in `Ready for Claude` gets one comment
 *    saying so (deduped by `linearComment`, so "once per issue" holds across
 *    restarts).
 * 4. **Reserve, then write.** The claim row goes into `claims` *before*
 *    anything is written to Linear. `claims.issue_id` is the primary key, so
 *    of N concurrent `claimNext()` calls exactly one insert succeeds — the
 *    SQLite equivalent of the spec's `SELECT … FOR UPDATE SKIP LOCKED`, and
 *    the same guarantee on Postgres via `ON CONFLICT DO NOTHING`.
 * 5. **`updatedAt` guard.** The issue is re-read immediately before the
 *    Linear write and its `updatedAt` compared with the value seen at poll
 *    time. Any change — a human assigned it, Justin moved it, a `Deferred`
 *    label was added — releases the claim and the loop moves on.
 *
 *    *Deviation from the spec text, recorded deliberately.* PAP-281 says
 *    "issueUpdate(...); re-read and compare updatedAt to updated_at_seen". A
 *    comparison made strictly after our own write can never match, because
 *    our write is itself an update. The guard is therefore taken before the
 *    write (which is what the edge case "issue leaves Ready for Claude
 *    between poll and claim: guard fails, skip" describes), and the read
 *    after the write verifies the opposite thing: that the issue is now
 *    `In Progress` and assigned to us, i.e. that our write, not someone
 *    else's, is the one that stands.
 * 6. **Pre-claim label re-check.** Labels are re-read in the same guard fetch,
 *    because a label added between poll and claim does not always move
 *    `updatedAt` in a way we can rely on (PAP-96 edge case).
 * 7. **Verify.** Re-read after the write; if the issue is not `In Progress`
 *    with our assignee, release.
 *
 * A claim is a reservation, not a session: `launchSession` (PAP-282) turns it
 * into one. This module only ever leaves an issue `In Progress` with a
 * `claims` row and a `sessions` row in status `claimed`.
 */

import type { LinearClient } from "@linear/sdk";
import type { OrchestratorConfig } from "../config.js";
import type { ClaimRow, OrchestratorDb } from "../db/index.js";
import type { EventBus } from "../events.js";
import { rawRequestWithRetry } from "./client.js";
import { linearComment } from "./comment.js";
import { characterOf, claimBlockedBy, orderQueue, type SkipReason } from "./filters.js";
import { fetchIssue, fetchReadyIssues, type IssueNode, READY_STATE } from "./issues.js";
import { requireState, type WorkspaceIds } from "./workspace.js";

const ISSUE_UPDATE = /* GraphQL */ `
  mutation OrchestratorClaim($id: String!, $input: IssueUpdateInput!) {
    issueUpdate(id: $id, input: $input) {
      success
      issue { id identifier updatedAt state { id name } assignee { id } }
    }
  }
`;

export interface Claim extends ClaimRow {
  issue: IssueNode;
}

export type ReleaseReason =
  | "guard-failed"
  | "deferred-after-fetch"
  | "umbrella-after-fetch"
  | "assigned-elsewhere"
  | "write-lost"
  | "session-ended"
  | "restart-recovery"
  | "hold"
  | string;

export interface ClaimDeps {
  client: LinearClient;
  db: OrchestratorDb;
  ids: WorkspaceIds;
  events: EventBus;
  config: OrchestratorConfig;
  /** Injected so PAP-99 can replace FIFO without editing this file. */
  pickNext?: (issues: IssueNode[]) => IssueNode | undefined;
  /** Test seam: the poll. */
  fetchReady?: (client: LinearClient, team: string) => Promise<IssueNode[]>;
  /** Test seam: the pre-claim re-read. */
  refetch?: (client: LinearClient, id: string) => Promise<IssueNode | undefined>;
  now?: () => Date;
  sessionId?: () => string;
  log?: (message: string) => void;
}

export interface ClaimAttempt {
  claim: Claim | null;
  /** Issues considered and why each was passed over, for `/status` and tests. */
  skipped: { identifier: string; reason: SkipReason | ReleaseReason }[];
}

function defaultSessionId(identifier: string, now: Date): string {
  const day = now.toISOString().slice(0, 10);
  return `${day}-${identifier}`;
}

/**
 * `<yyyy-mm-dd>-PAP-<n>`, with the `-<k>` re-run suffix the PAP-92 footer
 * schema allows when the same issue is claimed twice in one day (a release
 * and a re-claim, or a retry).
 */
function freshSessionId(deps: ClaimDeps, identifier: string, now: Date): string {
  const base = defaultSessionId(identifier, now);
  if (!deps.db.getSession(base)) return base;
  for (let k = 2; k < 100; k++) {
    const candidate = `${base}-${k}`;
    if (!deps.db.getSession(candidate)) return candidate;
  }
  throw new Error(`more than 99 sessions for ${identifier} today; refusing to claim again`);
}

/**
 * Claim at most one issue. Returns `null` when the queue is empty or every
 * candidate was filtered out; callers distinguish the two through `skipped`
 * on `claimNextDetailed()`.
 */
export async function claimNext(deps: ClaimDeps, character?: string): Promise<Claim | null> {
  const { claim } = await claimNextDetailed(deps, character);
  return claim;
}

export async function claimNextDetailed(
  deps: ClaimDeps,
  character?: string,
): Promise<ClaimAttempt> {
  const now = deps.now ?? (() => new Date());
  const fetchReady = deps.fetchReady ?? ((c, team) => fetchReadyIssues(c, team));
  const refetch = deps.refetch ?? ((c, id) => fetchIssue(c, id));
  const pick = deps.pickNext;
  const skipped: ClaimAttempt["skipped"] = [];

  const ready = await fetchReady(deps.client, deps.config.team);
  let queue = orderQueue(ready);
  if (character) {
    queue = queue.filter((i) => {
      const c = characterOf(i);
      return c === undefined || c === character.toLowerCase();
    });
  }

  while (queue.length > 0) {
    const issue = pick ? (pick(queue) ?? queue[0]) : queue[0];
    if (!issue) break;
    queue = queue.filter((i) => i.id !== issue.id);

    const blocked = claimBlockedBy(issue, READY_STATE);
    if (blocked) {
      skipped.push({ identifier: issue.identifier, reason: blocked });
      await noteNotClaimable(deps, issue, blocked);
      continue;
    }

    const resolvedCharacter = character ?? characterOf(issue) ?? deps.config.defaultCharacter;
    const at = now();
    const sessionId = deps.sessionId?.() ?? freshSessionId(deps, issue.identifier, at);

    // (4) Reserve. Exactly one concurrent caller gets `true`.
    const row: ClaimRow = {
      issueId: issue.id,
      identifier: issue.identifier,
      sessionId,
      character: resolvedCharacter,
      claimedAt: at.toISOString(),
      updatedAtSeen: issue.updatedAt,
    };
    if (!deps.db.insertClaim(row)) {
      skipped.push({ identifier: issue.identifier, reason: "assigned-elsewhere" });
      continue;
    }

    // (5)+(6) Guard: re-read before writing.
    let fresh: IssueNode | undefined;
    try {
      fresh = await refetch(deps.client, issue.id);
    } catch (err) {
      deps.db.deleteClaim(issue.id);
      throw err;
    }
    const guardFailure = guardFailureFor(fresh, row.updatedAtSeen);
    if (guardFailure) {
      release(deps, row, guardFailure);
      skipped.push({ identifier: issue.identifier, reason: guardFailure });
      continue;
    }

    // (5) Write: assign and move to In Progress.
    const assigneeId = deps.config.botUserId;
    if (!assigneeId) {
      deps.log?.(
        `claimNext: no botUserId configured (PAP-48 pending); claiming ${issue.identifier} unassigned`,
      );
    }
    try {
      const data = await rawRequestWithRetry<{
        issueUpdate: { success: boolean; issue?: { state: { name: string } } };
      }>(deps.client, ISSUE_UPDATE, {
        id: issue.id,
        input: {
          stateId: requireState(deps.ids, "In Progress"),
          ...(assigneeId ? { assigneeId } : {}),
        },
      });
      if (!data.issueUpdate.success) throw new Error("issueUpdate returned success: false");
    } catch (err) {
      release(deps, row, "write-failed");
      throw err;
    }

    // (7) Verify our write is the one that stands.
    const after = await refetch(deps.client, issue.id);
    if (after?.state.name !== "In Progress") {
      release(deps, row, "write-lost");
      skipped.push({ identifier: issue.identifier, reason: "write-lost" });
      continue;
    }
    if (assigneeId && after.assignee && after.assignee.id !== assigneeId) {
      release(deps, row, "assigned-elsewhere");
      skipped.push({ identifier: issue.identifier, reason: "assigned-elsewhere" });
      continue;
    }

    deps.db.insertSession({
      id: sessionId,
      issueId: issue.id,
      character: resolvedCharacter,
      model: null,
      worktree: null,
      branch: after.branchName ?? null,
      status: "claimed",
      startedAt: at.toISOString(),
    });
    deps.events.emit("issue.claimed", {
      issueId: issue.id,
      identifier: issue.identifier,
      sessionId,
      character: resolvedCharacter,
    });
    return { claim: { ...row, issue: after }, skipped };
  }

  return { claim: null, skipped };
}

/** Why the pre-write guard refused, or undefined when the claim may proceed. */
export function guardFailureFor(
  fresh: IssueNode | undefined,
  updatedAtSeen: string,
): ReleaseReason | undefined {
  if (!fresh) return "guard-failed";
  if (fresh.updatedAt !== updatedAtSeen) return "guard-failed";
  if (fresh.state.name !== READY_STATE) return "guard-failed";
  if (fresh.assignee) return "assigned-elsewhere";
  const blocked = claimBlockedBy(fresh, READY_STATE);
  if (blocked === "deferred") return "deferred-after-fetch";
  if (blocked === "umbrella") return "umbrella-after-fetch";
  if (blocked) return "guard-failed";
  return undefined;
}

/**
 * Drop a claim. Synchronous on purpose: releasing must never be the thing
 * that fails. The Linear side (moving the issue back) is the caller's job —
 * `retry()` in `transitions.ts` — because a release during the claim handshake
 * has not moved the issue yet.
 */
export function release(deps: ClaimDeps, claim: ClaimRow, reason: ReleaseReason): void {
  deps.db.deleteClaim(claim.issueId);
  const session = deps.db.getSession(claim.sessionId);
  if (session && session.status === "claimed") {
    deps.db.updateSession(claim.sessionId, {
      status: "released",
      endedAt: (deps.now ?? (() => new Date()))().toISOString(),
    });
  }
  deps.events.emit("issue.released", {
    issueId: claim.issueId,
    identifier: claim.identifier,
    sessionId: claim.sessionId,
    reason,
  });
}

/**
 * Restart recovery. A claim whose session never reached `running` (the
 * process died between claim and launch), or that is older than
 * `claim.staleClaimMs`, is released so the next cycle can pick the issue up
 * again. Sessions that were running are marked `interrupted` — PAP-282 owns
 * re-queuing those.
 */
export function recoverClaims(deps: ClaimDeps): { released: string[]; interrupted: string[] } {
  const now = (deps.now ?? (() => new Date()))().getTime();
  const released: string[] = [];
  const interrupted: string[] = [];
  for (const claim of deps.db.listClaims()) {
    const session = deps.db.getSession(claim.sessionId);
    const age = now - Date.parse(claim.claimedAt);
    const stale = age >= deps.config.claim.staleClaimMs;
    if (!session || session.status === "claimed" || stale) {
      if (session && session.status === "running") {
        deps.db.updateSession(session.id, {
          status: "interrupted",
          endedAt: new Date(now).toISOString(),
        });
        interrupted.push(claim.identifier);
      }
      release(deps, claim, "restart-recovery");
      released.push(claim.identifier);
      continue;
    }
    if (session.status === "running") {
      deps.db.updateSession(session.id, {
        status: "interrupted",
        endedAt: new Date(now).toISOString(),
      });
      release(deps, claim, "restart-recovery");
      interrupted.push(claim.identifier);
      released.push(claim.identifier);
    }
  }
  return { released, interrupted };
}

/** One comment per non-claimable issue found in Ready for Claude. */
async function noteNotClaimable(
  deps: ClaimDeps,
  issue: IssueNode,
  reason: SkipReason,
): Promise<void> {
  const labelled = issue.labels.nodes.some((l) => l.name === "Deferred");
  const body =
    reason === "deferred"
      ? labelled
        ? "not claimable: labelled `Deferred` (Execution Schedule v0.2). Left in Ready for Claude for PAP-93 to bounce; remove the label to make it claimable."
        : "not claimable: the Goal carries a deferral note (Execution Schedule v0.2). Left in Ready for Claude for PAP-93 to bounce; remove the note to make it claimable."
      : reason === "umbrella"
        ? "not claimable: this issue has sub-issues, so it is an umbrella (`UMBRELLA_NOT_CLAIMABLE`). Claim its children instead."
        : undefined;
  if (!body) return;
  try {
    await linearComment(
      { client: deps.client, db: deps.db, dryRun: false, log: deps.log },
      issue.id,
      body,
      {
        playbookVersion: 1,
        sessionId: defaultSessionId(issue.identifier, (deps.now ?? (() => new Date()))()),
        character: "orchestrator",
        issue: issue.identifier,
        status: "contract-failed",
        branch: issue.branchName ?? `feat/${issue.identifier}`,
        reason,
      },
    );
  } catch (err) {
    deps.log?.(`claimNext: could not comment on ${issue.identifier}: ${(err as Error).message}`);
  }
}

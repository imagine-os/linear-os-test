/**
 * The pure predicates the claim loop orders and filters by (PAP-281), and the
 * `isOpenBlocker` definition PAP-691's promotion check 3 shares.
 *
 * No network, no SDK, no database: every rule here is a function of an
 * `IssueNode`, so `tests/promotion-graph.test.ts` can run the whole fixture
 * graph through them.
 *
 * `isOpenBlocker` is the local mirror of PAP-93's `isOpen()`. While PAP-93 is
 * not yet on main this file is the only definition; once it lands,
 * `tests/promotion-graph.test.ts` imports `../src/contract/open.js` and
 * asserts the two agree on every blocker in the fixture, which is the
 * `promotion.validator_mismatch` guard the specs ask for, enforced at build
 * time instead of at run time.
 */

import type { Mode } from "../config.js";
import type { IssueNode, RelatedIssueNode } from "./issues.js";

export const DEFERRED_LABEL = "Deferred";

/** States in which a blocker still blocks, regardless of mode. */
export const OPEN_STATES = [
  "Backlog",
  "Todo",
  "Ready for Claude",
  "In Progress",
  "Needs Justin",
] as const;

/** States that close a blocker regardless of PR. `Duplicate` is Linear's
 * second canceled-type state on this team. */
export const CLOSED_STATES = ["Done", "Canceled", "Duplicate"] as const;

export const IN_REVIEW = "In Review";

/**
 * A deferral *statement* under Goal, as the plan writes it: a sentence that
 * starts with "Deferred" ("Deferred to v0.2 by the Execution Schedule …",
 * "Deferred; nothing waits on it.") or the phrase "deferred to v0.<n>" /
 * "deferred until …". A Goal that merely mentions the word ("the v0.2
 * deferred set", "what is deferred") is not a deferral: PAP-695 and PAP-701
 * were skipped as deferred by the looser `\bdeferred\b` check on live data.
 */
const DEFERRAL_SENTENCE_RE = /(?:^|[.;:!?]\s+)Deferred\b/m; // case-sensitive: a sentence, not the word
const DEFERRAL_PHRASE_RE = /\bdeferred (?:to v\d|until\b)/i;

/** The body of the Goal section (up to the next section heading), or undefined. */
export function goalSection(description: string): string | undefined {
  const lines = description.split(/\r?\n/);
  const isHeading = (l: string) => /^\s*(?:\*\*[^*]+\*\*\s*:?|#{1,3}\s+\S.*)\s*$/.test(l);
  const start = lines.findIndex((l) =>
    /^\s*(?:\*\*\s*Goal\s*\*\*\s*:?|#{1,3}\s+Goal)\s*$/i.test(l),
  );
  if (start < 0) return undefined;
  const body: string[] = [];
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i] ?? "";
    if (isHeading(line)) break;
    body.push(line);
  }
  return body.join("\n").trim();
}

/** The `Deferred` label, or a deferral note under Goal (PAP-92 deferred rule). */
export function isDeferred(
  issue: Pick<IssueNode, "labels"> & { description?: string | null },
): boolean {
  if (issue.labels.nodes.some((l) => l.name === DEFERRED_LABEL)) return true;
  const description = issue.description;
  if (!description) return false;
  const goal = goalSection(description);
  if (!goal) return false;
  return DEFERRAL_SENTENCE_RE.test(goal) || DEFERRAL_PHRASE_RE.test(goal);
}

/** An issue with sub-issues is an umbrella: never claimed, never promoted
 * (PAP-96 Umbrella rule, validator code `UMBRELLA_NOT_CLAIMABLE`). */
export function isUmbrella(issue: Pick<IssueNode, "children">): boolean {
  return issue.children.nodes.length > 0;
}

/** True when the blocker has a PR attachment (a forge PR URL on the issue). */
export function hasOpenPr(blocker: RelatedIssueNode): boolean {
  const nodes = blocker.attachments?.nodes ?? [];
  return nodes.some((a) => /\/(pull|pulls|merge_requests)\//.test(a.url));
}

/**
 * The branch-start rule, one definition (PAP-96 Spec check 3, PAP-93
 * `isOpen`). A blocker is open — still blocking — unless it is Done, Canceled
 * or Duplicate, or it is In Review and either a PR is attached (`pr-flow`) or
 * the mode is `build-loop`, where In Review means "pushed to main" and no PR
 * exists to check. An unknown state (Triage, a renamed state) is conservative:
 * still blocking.
 */
export function isOpenBlocker(blocker: RelatedIssueNode, mode: Mode = "build-loop"): boolean {
  const name = blocker.state.name;
  if ((OPEN_STATES as readonly string[]).includes(name)) return true;
  if ((CLOSED_STATES as readonly string[]).includes(name)) return false;
  if (name === IN_REVIEW) {
    if (mode === "build-loop") return false;
    return !hasOpenPr(blocker);
  }
  return true;
}

/** The inbound `blocks` relations of an issue, in identifier order. */
export function blockersOf(issue: Pick<IssueNode, "inverseRelations">): RelatedIssueNode[] {
  return (issue.inverseRelations?.nodes ?? [])
    .filter((r) => r.type === "blocks")
    .map((r) => r.issue)
    .sort((a, b) => a.identifier.localeCompare(b.identifier, "en", { numeric: true }));
}

/** `BASE_BRANCHES` for a promoted issue: the branches of its In Review
 * blockers, deterministic by identifier. Empty when every blocker is closed
 * outright or the mode is build-loop and In Review means main. */
export function baseBranchesFor(issue: Pick<IssueNode, "inverseRelations">): string[] {
  return blockersOf(issue)
    .filter((b) => b.state.name === IN_REVIEW && hasOpenPr(b))
    .map((b) => b.branchName ?? `feat/${b.identifier}`);
}

/** Why an issue in `Ready for Claude` cannot be claimed, or undefined when it can. */
export type SkipReason = "deferred" | "umbrella" | "assigned" | "wrong-state";

export function claimBlockedBy(
  issue: IssueNode,
  readyState = "Ready for Claude",
): SkipReason | undefined {
  if (issue.state.name !== readyState) return "wrong-state";
  if (issue.assignee) return "assigned";
  if (isDeferred(issue)) return "deferred";
  if (isUmbrella(issue)) return "umbrella";
  return undefined;
}

/**
 * The interim scheduler: FIFO by priority, then age (PAP-281 Scope, "pluggable
 * `pickNext()` … until PAP-99"). Linear's `priority` is 0 for "no priority",
 * which must sort last, not first.
 */
export function pickNext(issues: IssueNode[]): IssueNode | undefined {
  return orderQueue(issues)[0];
}

export function orderQueue(issues: IssueNode[]): IssueNode[] {
  return [...issues].sort((a, b) => {
    const pa = a.priority === 0 ? 5 : a.priority;
    const pb = b.priority === 0 ? 5 : b.priority;
    if (pa !== pb) return pa - pb;
    const ta = Date.parse(a.createdAt);
    const tb = Date.parse(b.createdAt);
    if (ta !== tb) return ta - tb;
    return a.identifier.localeCompare(b.identifier, "en", { numeric: true });
  });
}

/** `Character/Atlas` → `atlas`; undefined when the issue carries no character. */
export function characterOf(issue: Pick<IssueNode, "labels">): string | undefined {
  const label = issue.labels.nodes.find(
    (l) => l.parent?.name === "Character" || /^Character\//.test(l.name),
  );
  if (!label) return undefined;
  return label.name
    .replace(/^Character\//, "")
    .trim()
    .toLowerCase();
}

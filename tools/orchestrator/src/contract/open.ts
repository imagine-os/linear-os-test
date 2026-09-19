/**
 * `isOpen(blocker)` — the one definition of "this inbound blocker still blocks"
 * shared by `BLOCKED_BY_OPEN`, `READY_BUT_BLOCKED` and PAP-96 promotion check 3.
 * PAP-96's promotion test imports this so the two agree by construction.
 *
 * Spec (PAP-93, FIX-8): a blocker is open exactly when it is in Backlog, Todo,
 * Ready for Claude, In Progress or Needs Justin, or in In Review without an
 * open PR; closed when Done, Canceled, or In Review with a PR (branch-start
 * rule). Build-loop adaptation (2026-09-19): in `mode: "build-loop"` an In
 * Review blocker is closed without a PR check (In Review = pushed to main).
 */

import type { ContractMode } from "./config.js";
import type { Blocker } from "./types.js";

export const OPEN_STATES = [
  "Backlog",
  "Todo",
  "Ready for Claude",
  "In Progress",
  "Needs Justin",
] as const;

/** States that close a blocker regardless of PR (Duplicate is Linear's second canceled-type state). */
export const CLOSED_STATES = ["Done", "Canceled", "Duplicate"] as const;

export const IN_REVIEW = "In Review";

export interface IsOpenOptions {
  mode?: ContractMode;
}

export function isOpen(blocker: Blocker, opts: IsOpenOptions = {}): boolean {
  const mode = opts.mode ?? "build-loop";
  const name = blocker.state.name;
  if ((OPEN_STATES as readonly string[]).includes(name)) return true;
  if ((CLOSED_STATES as readonly string[]).includes(name)) return false;
  if (name === IN_REVIEW) {
    if (mode === "build-loop") return false;
    return !(blocker.pr?.open === true);
  }
  // Unknown or intake states (Triage, a renamed state): conservative, still blocking.
  return true;
}

/** `Done`, `In Review (PR open)`, `In Review (no PR)`, `Backlog` ... for fix texts and tables. */
export function describeBlocker(blocker: Blocker, opts: IsOpenOptions = {}): string {
  const name = blocker.state.name;
  if (name !== IN_REVIEW) return `${blocker.identifier} (${name})`;
  if ((opts.mode ?? "build-loop") === "build-loop") {
    return `${blocker.identifier} (In Review, build-loop: on main)`;
  }
  if (blocker.pr?.open) {
    return `${blocker.identifier} (In Review, PR ${blocker.pr.url ?? "open"})`;
  }
  return `${blocker.identifier} (In Review, no PR${blocker.branch ? `, branch ${blocker.branch}` : ""})`;
}

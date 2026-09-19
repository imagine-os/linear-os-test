/**
 * Issue-contract types (PAP-93). Pure data shapes: no network, no SDK.
 *
 * `ContractIssue` is the validator's input, shaped so a Linear GraphQL node
 * (`src/contract/linear-issue.ts::toContractIssue`), a fixture file and a
 * webhook payload all map onto it without the validator knowing the source.
 */

/** The eleven section names of the PaperOS Spec template, canonical spelling. */
export const SECTIONS = [
  "Goal",
  "Scope",
  "Spec",
  "Interface contract",
  "Definition of done",
  "Test plan",
  "Demo",
  "Edge cases",
  "Dependencies",
  "Agent",
  "Size",
] as const;
export type Section = (typeof SECTIONS)[number];

/** Required: `MISSING_SECTION` / `EMPTY_SECTION` are errors. */
export const REQUIRED_SECTIONS: readonly Section[] = [
  "Goal",
  "Scope",
  "Spec",
  "Definition of done",
  "Edge cases",
  "Dependencies",
  "Agent",
  "Size",
];

/** Recommended: absence warns. */
export const RECOMMENDED_SECTIONS: readonly Section[] = ["Interface contract", "Test plan", "Demo"];

export const VIOLATION_CODES = [
  "MISSING_SECTION",
  "EMPTY_SECTION",
  "SECTION_ORDER",
  "BAD_SIZE",
  "LABEL_PHASE",
  "LABEL_TYPE",
  "LABEL_SURFACE",
  "LABEL_CHARACTER",
  "NO_PROJECT",
  "NO_SPEC_LINK",
  "BLOCKED_BY_OPEN",
  "READY_BUT_BLOCKED",
  "UMBRELLA_NOT_CLAIMABLE",
  "DESCRIPTION_TOO_LONG",
] as const;
export type ViolationCode = (typeof VIOLATION_CODES)[number];

export type Severity = "error" | "warn";

export interface Violation {
  code: ViolationCode;
  severity: Severity;
  /** One sentence: what is wrong. */
  message: string;
  /** One or more sentences: what to change so the check passes. */
  fix: string;
}

export interface ContractResult {
  /** True when there is no `severity: "error"` violation (warnings allowed). */
  ok: boolean;
  violations: Violation[];
}

export interface IssueLabel {
  name: string;
  /** Parent (group) label name, e.g. `Phase`, `Type`, `Surface`, `Character`; null when ungrouped. */
  group?: string | null;
}

/** Enough of a PR/branch signal to decide the branch-start rule. */
export interface PullRequestRef {
  url?: string;
  /** True while the PR is open; a merged or closed PR does not count. */
  open: boolean;
}

/** An inbound `blocks` relation: the issue that blocks the one being validated. */
export interface Blocker {
  identifier: string;
  state: { name: string; type?: string | null };
  /** Linear-suggested or actual working branch name. */
  branch?: string | null;
  /** Open PR on the blocker's branch, when one is known. */
  pr?: PullRequestRef | null;
}

export interface ChildRef {
  identifier: string;
  state: { name: string; type?: string | null };
  /** Identifiers of sibling children that block this child (build order). */
  blockedBySiblings?: string[];
}

export interface AttachmentRef {
  url: string;
  title?: string | null;
  sourceType?: string | null;
}

export interface ContractIssue {
  id: string;
  identifier: string;
  title: string;
  description: string | null;
  state: { name: string; type?: string | null };
  labels: IssueLabel[];
  project: { id: string; name: string } | null;
  /** Parent issue; `description` lets a sub-issue inherit `NO_SPEC_LINK` satisfaction. */
  parent?: { identifier: string; description?: string | null } | null;
  children: ChildRef[];
  /** Inbound `blocks` relations (issues that block this one). Outbound edges never appear here. */
  blockedBy: Blocker[];
  attachments?: AttachmentRef[];
  /** True when the caller is about to claim this issue (PAP-96 `claimNext`), regardless of state. */
  claimTarget?: boolean;
}

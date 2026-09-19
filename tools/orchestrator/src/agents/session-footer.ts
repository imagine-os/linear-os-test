/**
 * PaperOS session footer (PAP-92).
 *
 * Every Linear comment a session posts ends with a fenced ```paperos-session
 * block holding one JSON object of this shape. The JSON Schema in
 * ./session-footer.schema.json is the source of truth; this file mirrors it as
 * a TypeScript type and exports the helpers the orchestrator, the dry run and
 * the tests share. Keep the two in step: `pnpm footer:validate` fails when a
 * fixture here stops validating against the schema.
 */
import schema from "./session-footer.schema.json" with { type: "json" };

/** Footers a session writes today use this. Both 1 and 2 still validate (see PLAYBOOK_VERSIONS); bump only when a field is added, removed or renamed. */
export const PLAYBOOK_VERSION = 2 as const;

/** Every playbookVersion the schema still accepts. */
export const PLAYBOOK_VERSIONS = [1, 2] as const;
export type PlaybookVersion = (typeof PLAYBOOK_VERSIONS)[number];

/** The fence language every footer block uses. */
export const FOOTER_FENCE = "paperos-session" as const;

export const CHARACTERS = [
  "atlas",
  "forge",
  "iris",
  "quill",
  "sentinel",
  "nova",
  "ledger",
  "beacon",
  "scout",
] as const;
export type Character = (typeof CHARACTERS)[number];

/** Non-lead roles that also post footers: the promotion pass, the merge-queue integrator and housekeeping/remediation passes (PAP-92). */
export const FOOTER_ROLES = ["orchestrator", "integrator", "scribe"] as const;
export type FooterRole = (typeof FOOTER_ROLES)[number];

export const SESSION_STATUSES = [
  "started",
  "progress",
  "ended",
  "partial",
  "contract-failed",
  "handoff",
  "review",
  "reviewed",
  "promoted",
  "integrated",
  "remediation",
] as const;
export type SessionStatus = (typeof SESSION_STATUSES)[number];

/** The review pass's outcome; required when `status` is `review` or `reviewed`. */
export const VERDICTS = ["pass", "fail"] as const;
export type Verdict = (typeof VERDICTS)[number];

/** Owned by PAP-108 (HandoffSchema); mirrored here until handoff.schema.json lands. */
export interface Handoff {
  kind:
    | "build-to-review"
    | "review-to-build"
    | "spec-to-build"
    | "research-to-decision"
    | "split"
    | "escalate";
  to: Character | "justin";
  reason: string;
  artifacts: { type: "branch" | "pr" | "doc" | "spec" | "screenshot"; ref: string }[];
  nextSteps: string[];
  openQuestions: { q: string; default: string }[];
  contextFiles: string[];
}

export interface SessionFooter {
  playbookVersion: PlaybookVersion;
  /** `<yyyy-mm-dd>-PAP-<n>` with an optional `-<k>` re-run suffix. */
  sessionId: string;
  /** Case-insensitive: either casing of a lead name validates. */
  character: Character | Capitalize<Character> | FooterRole;
  /** `PAP-<n>` */
  issue: string;
  status: SessionStatus;
  /** Required only on started/progress/ended/partial; absent on review/reviewed/promoted/integrated/remediation. */
  branch?: string;
  /** Required when `status` is `review` or `reviewed`. */
  verdict?: Verdict;
  /** Model id, e.g. `claude-fable-5-1`. */
  model?: string;
  costUsd?: number;
  turns?: number;
  /** Target (PR) mode only. */
  pr?: string;
  /** Build-loop mode: SHAs pushed to main, oldest first. */
  commits?: string[];
  /** Echo of `BASE_BRANCHES`; omitted when empty. */
  baseBranches?: string[];
  /** Why the session stopped early (duplicate-claim, needs-spec, base-branch-conflict, budget, ...). */
  reason?: string;
  handoff?: Handoff;
}

/** The schema object, for callers that compile it with ajv themselves. */
export const sessionFooterSchema = schema;

/** Render a footer as the fenced block that ends a comment. */
export function renderFooter(footer: SessionFooter): string {
  return `\`\`\`${FOOTER_FENCE}\n${JSON.stringify(footer)}\n\`\`\``;
}

const FENCE_RE = /```paperos-session[ \t]*\r?\n([\s\S]*?)\r?\n```[ \t]*$/;

/**
 * Extract and parse the footer from a comment body. Returns `undefined` when
 * the comment has no trailing paperos-session fence or the JSON does not parse;
 * callers validate the result against the schema.
 */
export function parseFooter(commentBody: string): unknown {
  const m = FENCE_RE.exec(commentBody.trimEnd());
  if (!m) return undefined;
  const json = m[1];
  if (json === undefined) return undefined;
  try {
    return JSON.parse(json);
  } catch {
    return undefined;
  }
}

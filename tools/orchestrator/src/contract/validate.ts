/**
 * `validateIssue(issue): ContractResult` — the pure issue-contract validator
 * (PAP-93). No network, no clock other than `config.now`, no Linear ids: the
 * webhook handler, `pnpm contract:audit`, PAP-96 promotion, PAP-118 and
 * PAP-307 all call this same function.
 *
 * Rules: docs/pm/issue-contract.md. Every rule here is one `check*` function
 * that pushes zero or more `Violation`s; `ok` is "no error-severity violation".
 */

import { type ContractConfig, resolveConfig } from "./config.js";
import { describeBlocker, isOpen } from "./open.js";
import { normalizeSize, parseSections, sectionOrder } from "./sections.js";
import {
  type Blocker,
  type ContractIssue,
  type ContractResult,
  RECOMMENDED_SECTIONS,
  REQUIRED_SECTIONS,
  type Section,
  type Severity,
  type Violation,
} from "./types.js";

export const SURFACE_LABELS = ["Customer", "Staff", "Developer", "Agent"] as const;

const TEMPLATE_HINT =
  "Use the `PaperOS Spec` template: each section is a bold line (`**Goal**`) or a `## Goal` heading on its own line, followed by its text.";

/** States in which the shape checks are downgraded to warnings (intake skeletons carry Goal + Source only). */
const INTAKE_STATES = new Set(["Triage"]);
/** States in which the contract does not apply at all (closed as not-done). */
const EXEMPT_STATES = new Set(["Canceled", "Duplicate"]);

export function validateIssue(
  issue: ContractIssue,
  configPartial?: Partial<ContractConfig>,
): ContractResult {
  const config = resolveConfig(configPartial);
  const violations: Violation[] = [];

  if (isExempt(issue)) return { ok: true, violations };

  const shapeSeverity: Severity = isIntake(issue) ? "warn" : "error";
  const description = checkDescriptionLength(issue, config, violations);
  const sections = parseSections(description);

  checkSections(description, sections, shapeSeverity, violations);
  checkSize(sections, shapeSeverity, violations);
  checkLabels(issue, shapeSeverity, config, violations);
  checkProject(issue, shapeSeverity, violations);
  checkSpecLink(issue, sections, config, violations);
  checkBlockers(issue, config, violations);
  checkUmbrella(issue, violations);

  return { ok: !violations.some((v) => v.severity === "error"), violations };
}

function isExempt(issue: ContractIssue): boolean {
  const t = issue.state.type ?? "";
  return EXEMPT_STATES.has(issue.state.name) || t === "canceled" || t === "duplicate";
}

function isIntake(issue: ContractIssue): boolean {
  return INTAKE_STATES.has(issue.state.name) || issue.state.type === "triage";
}

function checkDescriptionLength(
  issue: ContractIssue,
  config: ContractConfig,
  out: Violation[],
): string {
  const description = issue.description ?? "";
  if (description.length <= config.maxDescriptionChars) return description;
  out.push({
    code: "DESCRIPTION_TOO_LONG",
    severity: "warn",
    message: `Description is ${description.length.toLocaleString("en-US")} characters; the contract reads the first ${config.maxDescriptionChars.toLocaleString("en-US")}.`,
    fix: "Move long material (transcripts, research notes) into a linked Linear document or a `docs/` file and keep the issue body to the eleven sections.",
  });
  return description.slice(0, config.maxDescriptionChars);
}

function checkSections(
  description: string,
  sections: Partial<Record<Section, string>>,
  shapeSeverity: Severity,
  out: Violation[],
): void {
  const hasForeignHeading = /^\s*(Goal|Scope|Spec|Definition of done)\s*:/im.test(description);
  for (const s of REQUIRED_SECTIONS) {
    if (!(s in sections)) {
      out.push({
        code: "MISSING_SECTION",
        severity: shapeSeverity,
        message: `Required section \`${s}\` is missing.`,
        fix: hasForeignHeading
          ? `Add a \`**${s}**\` heading on its own line. A plain \`${s}:\` line is not a heading. ${TEMPLATE_HINT}`
          : `Add a \`**${s}**\` section. ${TEMPLATE_HINT}`,
      });
    } else if ((sections[s] ?? "").trim() === "") {
      out.push({
        code: "EMPTY_SECTION",
        severity: shapeSeverity,
        message: `Required section \`${s}\` is empty.`,
        fix: `Write the \`${s}\` section (one line is enough: for \`Dependencies\` write \`None\`).`,
      });
    }
  }
  for (const s of RECOMMENDED_SECTIONS) {
    if (!(s in sections)) {
      out.push({
        code: "MISSING_SECTION",
        severity: "warn",
        message: `Recommended section \`${s}\` is missing.`,
        fix: `Add a \`**${s}**\` section, or state why it does not apply.`,
      });
    }
  }
  // Order: required sections only, relative order against the canonical list.
  const present = sectionOrder(description).filter((s) => REQUIRED_SECTIONS.includes(s));
  const canonical = REQUIRED_SECTIONS.filter((s) => present.includes(s));
  if (present.length === canonical.length && present.some((s, i) => s !== canonical[i])) {
    out.push({
      code: "SECTION_ORDER",
      severity: "warn",
      message: `Sections appear as ${present.join(", ")}; the template order is ${canonical.join(", ")}.`,
      fix: "Reorder the sections to match the `PaperOS Spec` template. Any order is accepted; this is a warning.",
    });
  }
}

function checkSize(
  sections: Partial<Record<Section, string>>,
  shapeSeverity: Severity,
  out: Violation[],
): void {
  const size = sections.Size;
  if (size === undefined || size.trim() === "") return; // MISSING/EMPTY already reported
  if (normalizeSize(size) === undefined) {
    out.push({
      code: "BAD_SIZE",
      severity: shapeSeverity,
      message: `Size \`${firstLine(size)}\` is not one of S, M, L.`,
      fix: "Start the Size section with `S`, `M` or `L` (Small/Medium/Large are normalised). Text after the letter is fine: `M: one session.`",
    });
  }
}

function labelGroup(l: { name: string; group?: string | null }): {
  group: string | null;
  name: string;
} {
  if (l.group) return { group: l.group, name: l.name };
  const slash = l.name.indexOf("/");
  if (slash > 0) return { group: l.name.slice(0, slash), name: l.name.slice(slash + 1) };
  return { group: null, name: l.name };
}

function checkLabels(
  issue: ContractIssue,
  shapeSeverity: Severity,
  config: ContractConfig,
  out: Violation[],
): void {
  const grouped = issue.labels.map(labelGroup);
  const phases = grouped.filter((l) => l.group === "Phase");
  const types = grouped.filter((l) => l.group === "Type");
  const surfaces = grouped.filter(
    (l) =>
      l.group === "Surface" ||
      (l.group === null && (SURFACE_LABELS as readonly string[]).includes(l.name)),
  );
  const characters = grouped.filter((l) => l.group === "Character");

  if (phases.length !== 1) {
    out.push({
      code: "LABEL_PHASE",
      severity: shapeSeverity,
      message:
        phases.length === 0
          ? "No `Phase/*` label."
          : `${phases.length} \`Phase/*\` labels (${phases.map((l) => l.name).join(", ")}); exactly one is required.`,
      fix: "Set exactly one of `Phase/P0`, `Phase/P1`, `Phase/P2` (the Blueprint phase the issue ships in).",
    });
  }
  if (types.length !== 1) {
    out.push({
      code: "LABEL_TYPE",
      severity: shapeSeverity,
      message:
        types.length === 0
          ? "No `Type/*` label."
          : `${types.length} \`Type/*\` labels (${types.map((l) => l.name).join(", ")}); exactly one is required.`,
      fix: "Set exactly one of `Type/Build`, `Type/Spec`, `Type/Research`, `Type/Docs`, `Type/Infra`, `Type/Review`.",
    });
  }
  if (surfaces.length === 0) {
    out.push({
      code: "LABEL_SURFACE",
      severity: shapeSeverity,
      message: "No surface label.",
      fix: "Add at least one of `Surface/Customer`, `Surface/Staff`, `Surface/Developer`, `Surface/Agent` (who the work is for).",
    });
  }
  if (config.characterLabelWarn && characters.length === 0) {
    out.push({
      code: "LABEL_CHARACTER",
      severity: "warn",
      message:
        "No `Character/*` label; the orchestrator falls back to the project default (roster.json).",
      fix: "Add the lead character's label (`Character/Atlas` ... `Character/Scout`) named in the Agent section.",
    });
  }
}

function checkProject(issue: ContractIssue, shapeSeverity: Severity, out: Violation[]): void {
  if (!issue.project) {
    out.push({
      code: "NO_PROJECT",
      severity: shapeSeverity,
      message: "The issue belongs to no project.",
      fix: "Set the Linear project (one of the 23 module projects; the project's `Contract` section is required reading).",
    });
  }
}

/** A spec path (`specs/<project>/<slug>.spec.yaml`) or a Linear document link anywhere in a text. */
export const SPEC_LINK_RE =
  /specs\/[^\s`)>\]]+\.spec\.ya?ml|https:\/\/linear\.app\/[^\s)>\]]+\/document\/[^\s)>\]]+/i;

/** A route-shaped token: `/settings`, `/api/v1/tables/:id`, `/app/[tenant]/inbox`, never a file path with an extension. */
const ROUTE_RE =
  /(?:^|[\s`(])(\/[a-z][a-z0-9-]*(?:\/(?:[a-z0-9-]+|:[a-z][a-zA-Z0-9]*|\[[a-zA-Z0-9-]+\]|\{[a-zA-Z0-9-]+\}))*\/?)(?=$|[\s`),;:]|\.(?:\s|$))/m;

export function scopeNamesRoute(scope: string): boolean {
  const m = ROUTE_RE.exec(scope);
  if (!m) return false;
  const token = m[1] ?? "";
  // Exclude filesystem-looking paths the specs use for repo locations.
  return (
    !/^\/(workspace|tmp|usr|etc|var|home|root|dev|opt)(\/|$)/.test(token) && !/\.\w+$/.test(token)
  );
}

export function hasSpecLink(issue: ContractIssue): boolean {
  if (SPEC_LINK_RE.test(issue.description ?? "")) return true;
  if (
    (issue.attachments ?? []).some((a) => SPEC_LINK_RE.test(a.url) || /\.spec\.ya?ml$/i.test(a.url))
  )
    return true;
  // Sub-issue whose parent has a spec link inherits satisfaction (Edge cases).
  if (issue.parent?.description && SPEC_LINK_RE.test(issue.parent.description)) return true;
  return false;
}

function checkSpecLink(
  issue: ContractIssue,
  sections: Partial<Record<Section, string>>,
  config: ContractConfig,
  out: Violation[],
): void {
  const isBuild = issue.labels
    .map(labelGroup)
    .some((l) => l.group === "Type" && l.name === "Build");
  if (!isBuild) return;
  const scope = sections.Scope ?? "";
  if (!scopeNamesRoute(scope)) return;
  if (hasSpecLink(issue)) return;
  const strict = config.now().toISOString().slice(0, 10) >= config.strictSpecLinkFrom;
  out.push({
    code: "NO_SPEC_LINK",
    severity: strict ? "error" : "warn",
    message: `\`Type/Build\` issue whose Scope names a route has no spec link (a \`specs/**/*.spec.yaml\` path or a Linear document).${strict ? "" : ` Warning until ${config.strictSpecLinkFrom}, error after.`}`,
    fix: "Link the page/route spec: add the `specs/<project>/<slug>.spec.yaml` path or the Linear document URL to Scope or Spec (a sub-issue inherits its parent's link).",
  });
}

function checkBlockers(issue: ContractIssue, config: ContractConfig, out: Violation[]): void {
  const open = issue.blockedBy.filter((b) => isOpen(b, { mode: config.mode }));
  if (open.length === 0) return;
  const list = open.map((b) => describeBlocker(b, { mode: config.mode })).join(", ");
  const remedies = remedyText(open, config);
  if (issue.state.name === "Ready for Claude") {
    out.push({
      code: "READY_BUT_BLOCKED",
      severity: "error",
      message: `In Ready for Claude while blocked by open issue(s): ${list}.`,
      fix: `The Ready set holds only unblocked issues. ${remedies}`,
    });
    return;
  }
  out.push({
    code: "BLOCKED_BY_OPEN",
    severity: "error",
    message: `Blocked by open issue(s): ${list}.`,
    fix: `Not promotable until every blocker is closed. ${remedies}`,
  });
}

function remedyText(open: Blocker[], config: ContractConfig): string {
  const target =
    config.mode === "build-loop"
      ? "reaches In Review (pushed to main) or Done"
      : "reaches In Review with an open PR (branch-start rule) or Done";
  return (
    `Either wait until each blocker ${target}, ` +
    "or soften the dependency: delete the `blocks` relation and write the soft dependency with its fallback " +
    `(the branch to import, or the interface to build against) into the Dependencies section. Open: ${open
      .map((b) => b.identifier)
      .join(", ")}.`
  );
}

function checkUmbrella(issue: ContractIssue, out: Violation[]): void {
  if (issue.children.length === 0) return;
  const inFlight =
    issue.state.name === "Ready for Claude" ||
    issue.state.name === "In Progress" ||
    issue.claimTarget === true;
  if (!inFlight) return;
  const children = issue.children.map((c) => `${c.identifier} (${c.state.name})`).join(", ");
  const first =
    issue.children.find((c) => (c.blockedBySiblings ?? []).length === 0) ?? issue.children[0];
  const firstOpen = issue.children.find(
    (c) =>
      (c.blockedBySiblings ?? []).length === 0 &&
      isOpen({ identifier: c.identifier, state: c.state }),
  );
  const claim = firstOpen ?? first;
  out.push({
    code: "UMBRELLA_NOT_CLAIMABLE",
    severity: "error",
    message: `Umbrella with ${issue.children.length} sub-issue(s) (${children}) is never moved to Ready for Claude or claimed.`,
    fix: `Claim ${claim ? claim.identifier : "the first child"} instead (first child in build order). The session that finishes the last child runs the umbrella's integration test, attaches the evidence and moves the umbrella to In Review.`,
  });
}

function firstLine(s: string): string {
  return s.trim().split(/\r?\n/)[0]?.slice(0, 40) ?? "";
}

/** Convenience: error-severity codes of a result, deduplicated, in order. */
export function errorCodes(result: ContractResult): string[] {
  return [...new Set(result.violations.filter((v) => v.severity === "error").map((v) => v.code))];
}

/** Convenience: warn-severity codes of a result, deduplicated, in order. */
export function warnCodes(result: ContractResult): string[] {
  return [...new Set(result.violations.filter((v) => v.severity === "warn").map((v) => v.code))];
}

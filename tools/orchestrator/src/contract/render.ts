/**
 * Rendering for PAP-93: the violations comment (templates/violations.md, footer
 * `status: "contract-failed"`) and the audit table `pnpm contract:audit` prints
 * and posts.
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PLAYBOOK_VERSION, renderFooter, type SessionFooter } from "../agents/session-footer.js";
import type { ContractIssue, ContractResult, Violation, ViolationCode } from "./types.js";
import { errorCodes, warnCodes } from "./validate.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

export function loadTemplate(name = "violations"): string {
  return readFileSync(resolve(root, "templates", `${name}.md`), "utf8");
}

export function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const v = vars[key];
    if (v === undefined) throw new Error(`template placeholder {{${key}}} has no value`);
    return v;
  });
}

export interface RenderCommentOptions {
  /** What the handler did: "bounced" | "commented" | "audit". */
  outcome: "bounced" | "commented" | "audit";
  /** Set when the issue was moved (bounced) and where. */
  movedTo?: string;
  /** Working branch for the footer; defaults to feat/<identifier>. */
  branch?: string | null;
  now?: Date;
  template?: string;
}

function cell(s: string): string {
  return s.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

export function renderViolationRows(violations: Violation[]): string {
  const order = (v: Violation) => (v.severity === "error" ? 0 : 1);
  return [...violations]
    .sort((a, b) => order(a) - order(b))
    .map((v) => `| \`${v.code}\` | ${v.severity} | ${cell(v.message)} | ${cell(v.fix)} |`)
    .join("\n");
}

/** The comment posted on an issue that failed (or only warned). */
export function renderViolationsComment(
  issue: ContractIssue,
  result: ContractResult,
  opts: RenderCommentOptions,
): string {
  const errors = errorCodes(result);
  const warns = warnCodes(result);
  const verdict =
    errors.length > 0
      ? `${errors.length} error(s), ${warns.length} warning(s)`
      : `${warns.length} warning(s)`;
  let action: string;
  if (opts.outcome === "bounced") {
    action = `moved back to \`${opts.movedTo ?? "Backlog"}\`; fix the errors below and move it to \`Ready for Claude\` again (or wait for the promotion pass).`;
  } else if (errors.length > 0) {
    action =
      "left where it is (last actor is Justin: the validator comments, never moves). The errors below block claiming.";
  } else {
    action = "left in place; warnings only.";
  }
  const closing =
    errors.length > 0
      ? "Rules: `docs/pm/issue-contract.md` in `paperos-orchestrator`. Re-run locally with `pnpm contract:audit --issue " +
        issue.identifier +
        "`."
      : "Rules: `docs/pm/issue-contract.md` in `paperos-orchestrator`.";
  const now = opts.now ?? new Date();
  const footer: SessionFooter = {
    playbookVersion: PLAYBOOK_VERSION,
    sessionId: `${now.toISOString().slice(0, 10)}-${issue.identifier}`,
    character: "orchestrator",
    issue: issue.identifier,
    status: "contract-failed",
    branch: sanitizeBranch(opts.branch) ?? `feat/${issue.identifier}`,
    reason: errors.length > 0 ? errors.join(",") : `warnings:${warns.join(",")}`,
  };
  return fillTemplate(opts.template ?? loadTemplate(), {
    verdict,
    identifier: issue.identifier,
    action,
    rows: renderViolationRows(result.violations),
    closing,
    footer: JSON.stringify(footer),
  }).replace(/```paperos-session\n[\s\S]*?\n```/, renderFooter(footer));
}

function sanitizeBranch(b: string | null | undefined): string | undefined {
  if (!b) return undefined;
  return /^[A-Za-z0-9._/-]+$/.test(b) ? b : undefined;
}

/** Error codes that say "not claimable now", not "the issue body is malformed". */
export const READINESS_CODES: ReadonlySet<string> = new Set<ViolationCode>([
  "BLOCKED_BY_OPEN",
  "READY_BUT_BLOCKED",
  "UMBRELLA_NOT_CLAIMABLE",
]);

export interface AuditRow {
  identifier: string;
  title: string;
  state: string;
  errors: string[];
  warns: string[];
  /** Has sub-issues (never promoted or claimed, PAP-96 check 2). */
  umbrella: boolean;
  /** Carries the `Deferred` label (never promoted, PAP-96 check 1). */
  deferred: boolean;
}

export function toAuditRow(issue: ContractIssue, result: ContractResult): AuditRow {
  return {
    identifier: issue.identifier,
    title: issue.title,
    state: issue.state.name,
    errors: errorCodes(result),
    warns: warnCodes(result),
    umbrella: issue.children.length > 0,
    deferred: issue.labels.some((l) => l.name === "Deferred"),
  };
}

/** Zero errors, a leaf, not Deferred: what PAP-96 promotes from Backlog on its next cycle. */
export function isPromotable(row: AuditRow): boolean {
  return row.errors.length === 0 && !row.umbrella && !row.deferred;
}

export interface AuditTableOptions {
  /** List every row (default) or only rows with errors. */
  onlyErrors?: boolean;
  /** Cap the per-issue rows; the summary is always complete. */
  maxRows?: number;
  title?: string;
}

/** Markdown: summary per state, code histogram, then one row per issue. */
export function renderAuditTable(rows: AuditRow[], opts: AuditTableOptions = {}): string {
  const byIdent = (a: AuditRow, b: AuditRow) =>
    issueNumber(a.identifier) - issueNumber(b.identifier);
  const sorted = [...rows].sort(byIdent);
  const states = new Map<string, { total: number; errors: number; warns: number; clean: number }>();
  const codes = new Map<string, { errors: number; warns: number }>();
  for (const r of sorted) {
    const s = states.get(r.state) ?? { total: 0, errors: 0, warns: 0, clean: 0 };
    s.total++;
    if (r.errors.length > 0) s.errors++;
    else if (r.warns.length > 0) s.warns++;
    else s.clean++;
    states.set(r.state, s);
    for (const c of r.errors)
      codes.set(c, {
        ...(codes.get(c) ?? { errors: 0, warns: 0 }),
        errors: (codes.get(c)?.errors ?? 0) + 1,
      });
    for (const c of r.warns)
      codes.set(c, {
        ...(codes.get(c) ?? { errors: 0, warns: 0 }),
        warns: (codes.get(c)?.warns ?? 0) + 1,
      });
  }
  const totalErrors = sorted.filter((r) => r.errors.length > 0).length;
  const shapeErrors = sorted.filter((r) => r.errors.some((c) => !READINESS_CODES.has(c))).length;
  const readinessOnly = totalErrors - shapeErrors;
  const out: string[] = [];
  out.push(`### ${opts.title ?? "Issue contract audit"}`);
  out.push("");
  out.push(
    `${sorted.length} issue(s); ${shapeErrors} with contract (shape) errors; ${readinessOnly} blocked/unclaimable only (\`BLOCKED_BY_OPEN\`, \`READY_BUT_BLOCKED\`, \`UMBRELLA_NOT_CLAIMABLE\`); ${sorted.filter((r) => r.errors.length === 0 && r.warns.length > 0).length} warnings only; ${sorted.filter((r) => r.errors.length === 0 && r.warns.length === 0).length} clean.`,
  );
  const backlog = sorted.filter((r) => r.state === "Backlog");
  if (backlog.length > 0) {
    const promotable = backlog.filter(isPromotable);
    out.push("");
    out.push(
      `Pre-promotion list: ${promotable.length} of ${backlog.length} Backlog issue(s) promotable now (zero errors, leaf, not Deferred): ${promotable.map((r) => r.identifier).join(", ") || "none"}.`,
    );
  }
  out.push("");
  out.push("| State | Issues | With errors | Warnings only | Clean |");
  out.push("|---|---:|---:|---:|---:|");
  for (const [name, s] of [...states.entries()].sort((a, b) => b[1].total - a[1].total)) {
    out.push(`| ${name} | ${s.total} | ${s.errors} | ${s.warns} | ${s.clean} |`);
  }
  out.push("");
  out.push("| Code | As error | As warning |");
  out.push("|---|---:|---:|");
  for (const [code, n] of [...codes.entries()].sort(
    (a, b) => b[1].errors - a[1].errors || b[1].warns - a[1].warns,
  )) {
    out.push(`| \`${code}\` | ${n.errors} | ${n.warns} |`);
  }
  const listed = (opts.onlyErrors ? sorted.filter((r) => r.errors.length > 0) : sorted).slice(
    0,
    opts.maxRows ?? Infinity,
  );
  out.push("");
  out.push("| Issue | State | Errors | Warnings | Note |");
  out.push("|---|---|---|---|---|");
  for (const r of listed) {
    const note = [r.umbrella ? "umbrella" : "", r.deferred ? "Deferred" : ""]
      .filter(Boolean)
      .join(", ");
    out.push(
      `| ${r.identifier} | ${r.state} | ${r.errors.map((c) => `\`${c}\``).join(" ") || "—"} | ${r.warns.map((c) => `\`${c}\``).join(" ") || "—"} | ${note} |`,
    );
  }
  const hidden =
    (opts.onlyErrors ? sorted.filter((r) => r.errors.length > 0) : sorted).length - listed.length;
  if (hidden > 0) out.push(`| … | | ${hidden} more row(s) not shown | | |`);
  return out.join("\n");
}

function issueNumber(identifier: string): number {
  return Number(identifier.split("-")[1] ?? 0);
}

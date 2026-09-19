#!/usr/bin/env tsx
/**
 * PAP-93: `pnpm contract:audit [--state Backlog] [--issue PAP-n] [--mode build-loop|pr-flow]
 *                              [--only-errors] [--max-rows n] [--json] [--strict-readiness] [--from file.json] [--out file.md]`
 *
 * Read-only. Fetches every issue of team PAP (or one state, or one issue)
 * over the Linear GraphQL API in 100-issue pages, runs `validateIssue` on
 * each, prints the audit table (Markdown) and exits 1 when any issue has a
 * shape error (readiness errors such as BLOCKED_BY_OPEN only count with
 * --strict-readiness), 0 otherwise, 2 when Linear was unreachable. Never moves, labels or
 * comments on anything: the webhook handler owns the bounce.
 *
 * `--state Backlog` is the pre-promotion list: rows with zero errors are
 * exactly what PAP-96 promotes on its next cycle. `--from` replays a saved
 * JSON array of issue nodes (ISSUE_FIELDS shape) with no network.
 */

import { readFileSync, writeFileSync } from "node:fs";
import type { ContractMode } from "../contract/config.js";
import {
  fetchIssue,
  fetchTeamIssues,
  type LinearIssueNode,
  toContractIssue,
} from "../contract/linear-issue.js";
import {
  type AuditRow,
  READINESS_CODES,
  renderAuditTable,
  toAuditRow,
} from "../contract/render.js";
import { validateIssue } from "../contract/validate.js";
import { createLinearClient } from "../linear/client.js";

export interface AuditArgs {
  state?: string;
  issue?: string;
  mode: ContractMode;
  onlyErrors: boolean;
  maxRows?: number;
  json: boolean;
  strictReadiness: boolean;
  from?: string;
  out?: string;
  team: string;
}

export function parseArgs(argv: string[]): AuditArgs {
  const get = (flag: string): string | undefined => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const mode = (get("--mode") ?? process.env.PAPEROS_CONTRACT_MODE ?? "build-loop") as ContractMode;
  if (mode !== "build-loop" && mode !== "pr-flow") {
    throw new Error(`--mode must be build-loop or pr-flow, got "${mode}"`);
  }
  const maxRows = get("--max-rows");
  return {
    state: get("--state"),
    issue: get("--issue"),
    mode,
    onlyErrors: argv.includes("--only-errors"),
    maxRows: maxRows ? Number(maxRows) : undefined,
    json: argv.includes("--json"),
    strictReadiness: argv.includes("--strict-readiness"),
    from: get("--from"),
    out: get("--out"),
    team: get("--team") ?? "PAP",
  };
}

export interface AuditReport {
  rows: AuditRow[];
  details: { identifier: string; violations: ReturnType<typeof validateIssue>["violations"] }[];
  pages: number;
  complexity: number;
  mode: ContractMode;
  state?: string;
}

/** Pure part: nodes in, report out. */
export function auditNodes(
  nodes: LinearIssueNode[],
  mode: ContractMode,
): Omit<AuditReport, "pages" | "complexity"> {
  const rows: AuditRow[] = [];
  const details: AuditReport["details"] = [];
  for (const node of nodes) {
    const issue = toContractIssue(node);
    const result = validateIssue(issue, { mode });
    rows.push(toAuditRow(issue, result));
    if (result.violations.length > 0)
      details.push({ identifier: issue.identifier, violations: result.violations });
  }
  return { rows, details, mode };
}

export async function runAudit(
  args: AuditArgs,
  log: (s: string) => void = () => {},
): Promise<AuditReport> {
  let nodes: LinearIssueNode[];
  let pages = 0;
  let complexity = 0;
  if (args.from) {
    nodes = JSON.parse(readFileSync(args.from, "utf8")) as LinearIssueNode[];
    if (args.state) nodes = nodes.filter((n) => n.state.name === args.state);
    if (args.issue) nodes = nodes.filter((n) => n.identifier === args.issue);
    pages = 1;
  } else {
    const client = createLinearClient();
    if (args.issue) {
      nodes = [await fetchIssue(client, args.issue)];
      pages = 1;
    } else {
      nodes = await fetchTeamIssues(client, {
        teamKey: args.team,
        state: args.state,
        onPage: (p) => {
          pages = p.page;
          complexity += p.complexity ?? 0;
          log(`page ${p.page}: ${p.nodes} issue(s), complexity ${p.complexity ?? "?"}`);
        },
      });
    }
  }
  const partial = auditNodes(nodes, args.mode);
  return { ...partial, pages, complexity, state: args.state };
}

export function renderReport(report: AuditReport, args: AuditArgs): string {
  const scope = args.issue ? args.issue : args.state ? `state ${args.state}` : "whole team";
  const title = `Issue contract audit — ${scope}, mode ${report.mode}, ${new Date().toISOString().slice(0, 16)}Z`;
  const table = renderAuditTable(report.rows, {
    onlyErrors: args.onlyErrors,
    maxRows: args.maxRows,
    title,
  });
  const footer =
    report.complexity > 0
      ? `\n\n_${report.pages} page(s), Linear complexity ${report.complexity} total (budget 10,000 per query)._`
      : "";
  return table + footer;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  let report: AuditReport;
  try {
    report = await runAudit(args, (s) => console.error(s));
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(2);
  }
  const text = args.json ? JSON.stringify(report, null, 2) : renderReport(report, args);
  if (args.out) writeFileSync(args.out, `${text}\n`, "utf8");
  process.stdout.write(`${text}\n`);
  // Exit 1 on any shape error; readiness errors (BLOCKED_BY_OPEN etc.) are the
  // pre-promotion signal, not a broken issue, unless --strict-readiness is passed.
  const failing = report.rows.some((r) =>
    args.strictReadiness ? r.errors.length > 0 : r.errors.some((c) => !READINESS_CODES.has(c)),
  );
  process.exitCode = failing ? 1 : 0;
}

const invokedDirectly =
  typeof process.argv[1] === "string" && /contract-audit\.(ts|js)$/.test(process.argv[1]);
if (invokedDirectly) {
  main().catch((err) => {
    console.error(err instanceof Error ? (err.stack ?? err.message) : err);
    process.exit(2);
  });
}

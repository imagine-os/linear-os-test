#!/usr/bin/env tsx
import { ageHours, type DecisionCard, isHardBlock, parseCardBlock } from "../justin-queue/card.js";
import { DEFAULT_JUSTIN_QUEUE_CONFIG, type JustinQueueConfig } from "../justin-queue/config.js";
import { defaultAppliesAt } from "../justin-queue/defaults.js";
import { isAuthorizedReplier, parseReply } from "../justin-queue/parse-reply.js";
/**
 * `pnpm justin:queue list [--check] [--json]` (PAP-94).
 *
 * Read-only operator view of the Needs Justin queue over the live team: every
 * issue in `Needs Justin`, the decision card parsed out of its description or
 * comments, the asks still unanswered, the age against the 48 h default and
 * whether the five-slot cap holds. It issues GraphQL **queries only** — no
 * mutation, no state move, no comment — so it is safe to run at any time.
 *
 * Run it with the sandbox proxy env, like every Linear script in this repo:
 * `NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt
 * LINEAR_API_KEY=placeholder pnpm justin:queue list --check`
 * (docs/pm/linear-setup.md, "Running the script in an agent sandbox").
 *
 *   pnpm justin:queue list            # the table
 *   pnpm justin:queue list --check    # same, plus invariants; exit 1 on a violation
 *   pnpm justin:queue list --json     # machine-readable, for the digest
 *
 * Policy: docs/pm/justin-queue.md
 */
import { createLinearClient, rawRequestWithRetry } from "../linear/client.js";
import { loadWorkspaceIds, requireState } from "../linear/workspace.js";

interface LiveComment {
  body: string;
  createdAt: string;
  user: { name: string; email?: string | null } | null;
}

interface LiveIssue {
  identifier: string;
  title: string;
  priority: number;
  updatedAt: string;
  description: string | null;
  labels: { nodes: { name: string }[] };
  comments: { nodes: LiveComment[] };
}

interface IssuesResponse {
  team: { issues: { nodes: LiveIssue[] } };
}

const QUERY = `
query NeedsJustin($team: String!, $state: ID!) {
  team(id: $team) {
    issues(filter: { state: { id: { eq: $state } } }, first: 50) {
      nodes {
        identifier
        title
        priority
        updatedAt
        description
        labels { nodes { name } }
        comments(last: 25) { nodes { body createdAt user { name email } } }
      }
    }
  }
}`;

export interface QueueRow {
  issue: string;
  title: string;
  priority: number;
  nj: string;
  /** `card` = a parsed paperos-card block; `legacy` = prose only. */
  kind: "card" | "legacy";
  key?: string;
  openedAt: string;
  ageHours: number;
  dueAt?: string;
  overdue: boolean;
  hardBlock: boolean;
  openAsks: string[];
  totalAsks: number;
  /** Decisions found in later comments from an authorised author. */
  replies: string[];
}

const NJ_IN_PROSE = /\bNJ-(\d+)\b/;

/** Builds one row per Needs Justin issue. Pure over the fetched payload. */
export function rowsFrom(
  issues: readonly LiveIssue[],
  now: Date,
  config: JustinQueueConfig = DEFAULT_JUSTIN_QUEUE_CONFIG,
): QueueRow[] {
  const rows: QueueRow[] = [];
  for (const issue of issues) {
    const bodies = [
      ...(issue.description
        ? [{ body: issue.description, createdAt: issue.updatedAt, user: null }]
        : []),
      ...issue.comments.nodes,
    ];
    const cardComment = bodies.find((c) => parseCardBlock(c.body) !== undefined);
    const card: DecisionCard | undefined = cardComment
      ? parseCardBlock(cardComment.body)
      : undefined;
    const legacy = bodies.find((c) => /needs justin/i.test(c.body));

    const replies: string[] = [];
    for (const c of issue.comments.nodes) {
      const author = c.user?.email ?? c.user?.name ?? undefined;
      if (!isAuthorizedReplier(author, config)) continue;
      if (c === cardComment || c === legacy) continue;
      for (const d of parseReply(c.body, { author, config }).decisions) {
        replies.push(
          `${d.verb}${d.target ? ` ${d.target}` : ""}${d.option ? ` #${d.option}` : ""}`,
        );
      }
    }

    if (card) {
      const due = defaultAppliesAt(card, config);
      rows.push({
        issue: issue.identifier,
        title: issue.title,
        priority: issue.priority,
        nj: card.nj,
        kind: "card",
        key: card.key,
        openedAt: card.openedAt,
        ageHours: ageHours(card, now),
        dueAt: due.toISOString(),
        overdue: now >= due && !isHardBlock(card),
        hardBlock: isHardBlock(card),
        openAsks: card.asks.filter((a) => a.status === "open").map((a) => a.id),
        totalAsks: card.asks.length,
        replies,
      });
      continue;
    }

    const openedAt = legacy?.createdAt ?? issue.updatedAt;
    const age = (now.getTime() - Date.parse(openedAt)) / 3_600_000;
    rows.push({
      issue: issue.identifier,
      title: issue.title,
      priority: issue.priority,
      nj: NJ_IN_PROSE.exec(legacy?.body ?? "")?.[0] ?? "NJ-?",
      kind: "legacy",
      openedAt,
      ageHours: age,
      overdue: false,
      hardBlock: false,
      openAsks: replies.length > 0 ? [] : ["(unstructured: whole card)"],
      totalAsks: 1,
      replies,
    });
  }
  return rows.sort((a, b) => a.priority - b.priority || b.ageHours - a.ageHours);
}

export interface CheckResult {
  errors: string[];
  warnings: string[];
}

/** The invariants `--check` enforces. Errors exit 1; warnings only print. */
export function checkRows(
  rows: readonly QueueRow[],
  config: JustinQueueConfig = DEFAULT_JUSTIN_QUEUE_CONFIG,
): CheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (rows.length > config.maxOpen) {
    errors.push(`${rows.length} open cards, cap is ${config.maxOpen} (bump the newest non-urgent)`);
  }
  const keys = rows.map((r) => r.key).filter((k): k is string => Boolean(k));
  const dupes = keys.filter((k, i) => keys.indexOf(k) !== i);
  for (const k of new Set(dupes)) errors.push(`two open cards share the key "${k}"; dedupe them`);
  for (const r of rows) {
    if (r.kind === "legacy") {
      warnings.push(
        `${r.issue} ${r.nj}: prose card with no paperos-card block; re-file it from templates/needs-justin-card.md`,
      );
    }
    if (r.overdue) {
      warnings.push(
        `${r.issue} ${r.nj}: past its ${config.defaultTimeoutHours} h window; the default applies and the slot frees`,
      );
    }
    if (r.hardBlock && r.ageHours > config.defaultTimeoutHours) {
      warnings.push(`${r.issue} ${r.nj}: hard block open ${r.ageHours.toFixed(0)} h; nudge Justin`);
    }
    if (r.replies.length > 0 && r.openAsks.length > 0) {
      warnings.push(
        `${r.issue} ${r.nj}: replies seen (${r.replies.join(", ")}) but asks still open`,
      );
    }
  }
  return { errors, warnings };
}

export function formatTable(rows: readonly QueueRow[], config: JustinQueueConfig): string {
  const lines = [
    `Needs Justin: ${rows.length} open of ${config.maxOpen}`,
    "",
    [
      "NJ".padEnd(5),
      "ISSUE".padEnd(7),
      "AGE h".padStart(5),
      "DUE (default)".padEnd(24),
      "ASKS".padEnd(9),
      "TITLE",
    ].join("  "),
  ];
  for (const r of rows) {
    lines.push(
      [
        r.nj.padEnd(5),
        r.issue.padEnd(7),
        r.ageHours.toFixed(1).padStart(5),
        (r.hardBlock ? "hard block" : (r.dueAt ?? "—")).padEnd(24),
        `${r.openAsks.length}/${r.totalAsks}`.padEnd(9),
        r.title.slice(0, 60),
      ].join("  "),
    );
    for (const a of r.openAsks) lines.push(`        · ${a}`);
    if (r.replies.length > 0) lines.push(`        replies: ${r.replies.join(", ")}`);
  }
  return lines.join("\n");
}

async function main(argv: string[]): Promise<number> {
  const command = argv.find((a) => !a.startsWith("--")) ?? "list";
  if (command !== "list") {
    console.error(`unknown command "${command}"; the only command is "list"`);
    return 2;
  }
  const check = argv.includes("--check");
  const json = argv.includes("--json");
  const config = DEFAULT_JUSTIN_QUEUE_CONFIG;

  const ids = await loadWorkspaceIds();
  const client = createLinearClient();
  const data = await rawRequestWithRetry<IssuesResponse>(client, QUERY, {
    team: ids.team.id,
    state: requireState(ids, "Needs Justin"),
  });
  const rows = rowsFrom(data.team.issues.nodes, new Date(), config);
  const result = check ? checkRows(rows, config) : { errors: [], warnings: [] };

  if (json) {
    console.log(JSON.stringify({ rows, ...result, maxOpen: config.maxOpen }, null, 2));
  } else {
    console.log(formatTable(rows, config));
    for (const w of result.warnings) console.log(`warn  ${w}`);
    for (const e of result.errors) console.log(`ERROR ${e}`);
    if (check) {
      console.log(
        result.errors.length === 0
          ? `\ncheck ok — ${rows.length}/${config.maxOpen} slots used, ${result.warnings.length} warning(s)`
          : `\ncheck failed — ${result.errors.length} error(s)`,
      );
    }
  }
  return check && result.errors.length > 0 ? 1 : 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main(process.argv.slice(2)).then(
    (code) => process.exit(code),
    (err: unknown) => {
      console.error(err instanceof Error ? err.message : String(err));
      process.exit(2);
    },
  );
}

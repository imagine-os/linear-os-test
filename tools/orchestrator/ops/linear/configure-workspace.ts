#!/usr/bin/env tsx
/**
 * PAP-91: turn the Linear configuration of team PAP into code.
 *
 * Usage:
 *   pnpm linear:configure --check [--team PAP]
 *   pnpm linear:configure --apply [--team PAP]
 *
 * `--check` prints the drift table and exits 1 if there is any drift, 0 if
 * there is none. `--apply` creates/updates what is missing, re-checks, and
 * exits 1 if drift remains (it never should, once labels/templates apply
 * cleanly). Refuses to run unless the team key is "PAP" or `--team` names
 * it explicitly, and refuses before the first mutation if the API key has
 * no admin scope.
 */

import { applyDiff } from "../../src/linear/apply.js";
import { createLinearClient, rawRequestWithRetry } from "../../src/linear/client.js";
import { desiredConfig } from "../../src/linear/desired.js";
import { diffWorkspace, renderDiffTable } from "../../src/linear/diff.js";
import { fetchLiveSnapshot } from "../../src/linear/snapshot.js";
import type { WorkspaceIds } from "../../src/linear/workspace.js";

function parseArgs(argv: string[]) {
  const mode = argv.includes("--apply") ? "apply" : argv.includes("--check") ? "check" : undefined;
  const teamIdx = argv.indexOf("--team");
  const team = teamIdx >= 0 ? argv[teamIdx + 1] : undefined;
  return { mode, team };
}

async function assertAdminScope(client: ReturnType<typeof createLinearClient>): Promise<void> {
  const data = await rawRequestWithRetry<{ viewer: { admin: boolean; name: string } }>(
    client,
    `query { viewer { admin name } }`,
  );
  if (!data.viewer.admin) {
    throw new Error(
      `API key belongs to "${data.viewer.name}" who is not a workspace admin. ` +
        `Refusing to run --apply: an admin-scoped key is required (Edge cases, PAP-91).`,
    );
  }
}

function buildLabelIdMap(
  labels: { id: string; name: string; parentName?: string | null }[],
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const l of labels) {
    const key = l.parentName ? `${l.parentName}/${l.name}` : l.name;
    map[key] = l.id;
    // Also index group labels and any bare name once, so apply() can look
    // up a parent group ("Character") by its plain name.
    if (!l.parentName) map[l.name] = l.id;
  }
  return map;
}

async function main() {
  const { mode, team: teamOverride } = parseArgs(process.argv.slice(2));
  if (!mode) {
    console.error("Usage: pnpm linear:configure --check|--apply [--team PAP]");
    process.exit(2);
  }

  const client = createLinearClient();
  const desired = desiredConfig();
  const teamKey = teamOverride ?? desired.team.key;

  if (teamKey !== "PAP" && !teamOverride) {
    console.error(`Refusing to run: team key "${teamKey}" is not "PAP" and --team was not given.`);
    process.exit(2);
  }

  let live = await fetchLiveSnapshot(client, teamKey);
  if (live.team.key !== "PAP" && !teamOverride) {
    console.error(`Refusing to run: live team key "${live.team.key}" is not "PAP".`);
    process.exit(2);
  }

  let rows = diffWorkspace(live, desired);
  console.log(`Team ${live.team.key} (${live.team.id})`);
  console.log(renderDiffTable(rows));

  if (mode === "check") {
    process.exit(rows.length === 0 ? 0 : 1);
  }

  // --apply
  await assertAdminScope(client);

  const flatLabelIdsBefore = buildLabelIdMap(live.labels);
  const result = await applyDiff(client, live.team.id, rows, flatLabelIdsBefore);
  console.log(
    `Applied ${result.applied.length} change(s); ${result.skippedManual.length} left as manual.`,
  );

  // Re-check: must print no drift.
  live = await fetchLiveSnapshot(client, teamKey);
  rows = diffWorkspace(live, desired);
  console.log("\nRe-check after --apply:");
  console.log(renderDiffTable(rows));

  const ids = buildWorkspaceIds(live);
  const fs = await import("node:fs/promises");
  await fs.writeFile("linear-workspace.json", `${JSON.stringify(ids, null, 2)}\n`, "utf8");
  console.log(`Wrote linear-workspace.json (${Object.keys(ids.labels).length} labels).`);

  process.exit(rows.length === 0 ? 0 : 1);
}

function buildWorkspaceIds(live: Awaited<ReturnType<typeof fetchLiveSnapshot>>): WorkspaceIds {
  const labels: Record<string, string> = {};
  for (const l of live.labels) {
    const key = l.parentName ? `${l.parentName}/${l.name}` : l.name;
    labels[key] = l.id;
  }
  const states: Record<string, string> = {};
  for (const s of live.states) states[s.name] = s.id;
  const templates: Record<string, string> = {};
  for (const t of live.templates) templates[t.name] = t.id;
  const projects: Record<string, string> = {};
  for (const p of live.projects) projects[p.name] = p.id;
  const cycles: Record<string, string> = {};
  for (const c of live.cycles) cycles[c.name] = c.id;

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    team: live.team,
    states,
    labels,
    templates,
    projects,
    cycles,
    teamSettings: live.teamSettings,
  };
}

main().catch((err) => {
  console.error(err instanceof Error ? (err.stack ?? err.message) : err);
  process.exit(1);
});

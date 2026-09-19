#!/usr/bin/env tsx

/**
 * `pnpm orchestrator:loop` (PAP-281): run the poll cycle.
 *
 * Defaults are deliberately safe. Without `--apply` the process does one
 * cycle in dry-run mode: it polls Linear (read-only), prints what it would
 * claim, and writes nothing. `--apply` is what actually claims; `--once` runs
 * a single cycle either way; `--watch` keeps cycling at `pollIntervalMs` and
 * serves `/healthz` and `/status`.
 *
 * Exit codes: 0 ran, 2 Linear unreachable or the workspace ids are missing.
 */

import { loadConfig } from "../config.js";
import { openDb } from "../db/index.js";
import { createEventBus } from "../events.js";
import { startHttpServer } from "../http.js";
import { createLinearClient } from "../linear/client.js";
import { claimBlockedBy, orderQueue } from "../linear/filters.js";
import { fetchReadyIssues } from "../linear/issues.js";
import { loadWorkspaceIds } from "../linear/workspace.js";
import { createLoop } from "../loop.js";
import { DryRunLauncher } from "../session/launcher.js";
import { validatorStatus } from "../validator.js";

export async function main(argv = process.argv.slice(2)): Promise<number> {
  const apply = argv.includes("--apply");
  const watch = argv.includes("--watch");
  const config = await loadConfig();
  const client = createLinearClient();

  if (!apply) {
    // Read-only preview: what would the next cycle claim?
    let ready: Awaited<ReturnType<typeof fetchReadyIssues>>;
    try {
      ready = await fetchReadyIssues(client, config.team);
    } catch (err) {
      console.error(`orchestrator:loop — Linear unreachable: ${(err as Error).message}`);
      return 2;
    }
    const queue = orderQueue(ready);
    console.log(
      `orchestrator:loop --dry-run — ${queue.length} issue(s) in Ready for Claude on ${config.team}, mode ${config.mode}`,
    );
    for (const issue of queue) {
      const blocked = claimBlockedBy(issue);
      console.log(
        `  ${issue.identifier.padEnd(9)} p${issue.priority}  ${blocked ? `skip (${blocked})` : "claimable"}  ${issue.title.slice(0, 70)}`,
      );
    }
    console.log("\nnothing was written. Re-run with --apply to claim.");
    return 0;
  }

  const ids = await loadWorkspaceIds(config.workspaceIdsPath);
  const db = await openDb(config.db.path);
  const events = createEventBus(db);
  const loop = createLoop({
    config,
    client,
    db,
    ids,
    events,
    launcher: new DryRunLauncher(console.log),
  });
  const validator = await validatorStatus();

  if (!watch) {
    const report = await loop.runCycle();
    console.log(JSON.stringify({ ...report, validator }, null, 2));
    db.close();
    return report.errors.length > 0 ? 2 : 0;
  }

  const server = await startHttpServer({
    config,
    db,
    passes: () => loop.passes,
    validator: () => validator,
  });
  console.log(`orchestrator: http://${config.http.host}:${config.http.port}/status`);
  const shutdown = () => {
    loop.stop();
    server.close();
    db.close();
  };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
  await loop.start();
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().then((code) => {
    process.exitCode = code;
  });
}

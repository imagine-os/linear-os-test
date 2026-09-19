#!/usr/bin/env tsx
/**
 * `pnpm orchestrator:status` (PAP-281): print what the loop currently holds.
 *
 * Read-only: it opens the database and the config, prints the claims, the
 * sessions and the last events, and exits. It never talks to Linear, so it is
 * safe to run against production while the loop is live.
 *
 * Exit codes: 0 printed, 2 the database could not be opened.
 */

import { loadConfig } from "../config.js";
import { openDb } from "../db/index.js";
import { buildStatus } from "../http.js";
import { validatorStatus } from "../validator.js";

function table(rows: string[][], headers: string[]): string {
  const all = [headers, ...rows];
  const widths = headers.map((_, i) => Math.max(...all.map((r) => (r[i] ?? "").length)));
  const line = (r: string[]) => r.map((c, i) => (c ?? "").padEnd(widths[i] ?? 0)).join("  ");
  return [line(headers), line(widths.map((w) => "-".repeat(w))), ...rows.map(line)].join("\n");
}

export async function main(argv = process.argv.slice(2)): Promise<number> {
  const asJson = argv.includes("--json");
  const config = await loadConfig();
  let db: Awaited<ReturnType<typeof openDb>>;
  try {
    db = await openDb(config.db.path);
  } catch (err) {
    console.error(`orchestrator:status — cannot open ${config.db.path}: ${(err as Error).message}`);
    return 2;
  }
  const validator = await validatorStatus();
  const status = buildStatus({ config, db, validator: () => validator });

  if (asJson) {
    console.log(JSON.stringify(status, null, 2));
    db.close();
    return 0;
  }

  console.log(
    `orchestrator — mode ${status.mode}, team ${status.team}, ` +
      `${status.claims.length}/${status.maxParallel} slots held, validator ${status.validator}`,
  );
  console.log("");
  console.log(
    status.claims.length === 0
      ? "claims: none"
      : table(
          status.claims.map((c) => [c.issue, c.character, c.sessionId, c.claimedAt]),
          ["ISSUE", "CHARACTER", "SESSION", "CLAIMED AT"],
        ),
  );
  console.log("");
  console.log(
    status.sessions.length === 0
      ? "sessions: none"
      : table(
          status.sessions.map((s) => [
            s.sessionId,
            s.status,
            s.character,
            s.branch ?? "-",
            s.startedAt,
          ]),
          ["SESSION", "STATUS", "CHARACTER", "BRANCH", "STARTED AT"],
        ),
  );
  db.close();
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().then((code) => {
    process.exitCode = code;
  });
}

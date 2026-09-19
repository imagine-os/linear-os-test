/** `GET /healthz` and `GET /status` (PAP-281 skeleton). */

import type { AddressInfo } from "node:net";
import { DatabaseSync } from "node:sqlite";
import { afterEach, describe, expect, it } from "vitest";
import { parseConfig } from "../src/config.js";
import { SqliteOrchestratorDb } from "../src/db/index.js";
import { buildStatus, createHttpServer } from "../src/http.js";

const servers: { close: (cb?: () => void) => void }[] = [];
afterEach(() => {
  for (const s of servers.splice(0)) s.close();
});

function fixture() {
  const db = new SqliteOrchestratorDb(new DatabaseSync(":memory:"));
  db.insertClaim({
    issueId: "u-1",
    identifier: "PAP-281",
    sessionId: "s-1",
    character: "atlas",
    claimedAt: "2026-09-19T00:00:00.000Z",
    updatedAtSeen: "2026-09-19T00:00:00.000Z",
  });
  db.insertSession({
    id: "s-1",
    issueId: "u-1",
    character: "atlas",
    model: "claude-opus-5",
    worktree: "/workspace/wt/PAP-281",
    branch: "feat/PAP-281-poll-claim-transitions",
    status: "running",
    startedAt: "2026-09-19T00:00:00.000Z",
  });
  db.appendEvent({ kind: "issue.claimed", issueId: "u-1" });
  return { db, config: parseConfig({ http: { port: 0, host: "127.0.0.1" } }) };
}

describe("buildStatus", () => {
  it("reports mode, slots, claims, sessions and the validator", () => {
    const { db, config } = fixture();
    const status = buildStatus({ config, db, passes: () => ["promotion"] });
    expect(status.mode).toBe("build-loop");
    expect(status.claims).toHaveLength(1);
    expect(status.sessions[0]?.branch).toBe("feat/PAP-281-poll-claim-transitions");
    expect(status.validator).toBe("unavailable");
    expect(status.passes).toEqual(["promotion"]);
    expect(status.recentEvents[0]?.kind).toBe("issue.claimed");
  });
});

describe("http server", () => {
  it("answers /healthz, /status, 404 and 405", async () => {
    const { db, config } = fixture();
    const server = createHttpServer({ config, db });
    servers.push(server);
    await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
    const port = (server.address() as AddressInfo).port;
    const base = `http://127.0.0.1:${port}`;

    const health = await fetch(`${base}/healthz`);
    expect(health.status).toBe(200);
    expect((await health.json()).ok).toBe(true);

    const status = await fetch(`${base}/status`);
    expect(status.status).toBe(200);
    expect((await status.json()).claims).toHaveLength(1);

    expect((await fetch(`${base}/nope`)).status).toBe(404);
    expect((await fetch(`${base}/status`, { method: "POST" })).status).toBe(405);
  });
});

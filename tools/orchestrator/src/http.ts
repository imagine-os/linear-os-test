/**
 * `GET /healthz` and `GET /status` (PAP-281 skeleton; PAP-283 deploys it and
 * PAP-113 renders it).
 *
 * `node:http` with no framework on purpose: this is two read-only endpoints
 * on a loopback port, and a dependency here would be a dependency in the
 * production image. The `SessionStatus[]` shape is PAP-288's; until that
 * issue lands the fields below are what `/status` promises, and PAP-283's
 * runbook reads them.
 */

import { createServer, type Server } from "node:http";
import type { OrchestratorConfig } from "./config.js";
import type { OrchestratorDb } from "./db/index.js";

export interface SessionStatus {
  sessionId: string;
  issue: string;
  character: string;
  model: string | null;
  branch: string | null;
  worktree: string | null;
  status: string;
  startedAt: string;
  endedAt: string | null;
}

export interface StatusPayload {
  mode: OrchestratorConfig["mode"];
  team: string;
  uptimeMs: number;
  maxParallel: number;
  claims: { issue: string; sessionId: string; character: string; claimedAt: string }[];
  sessions: SessionStatus[];
  /** "available" once PAP-93's validator is importable, "unavailable" before. */
  validator: "available" | "unavailable";
  passes: string[];
  recentEvents: { kind: string; issue: string | null; at: string }[];
}

export interface StatusDeps {
  config: OrchestratorConfig;
  db: OrchestratorDb;
  startedAt?: Date;
  passes?: () => string[];
  validator?: () => "available" | "unavailable";
}

export function buildStatus(deps: StatusDeps): StatusPayload {
  const startedAt = deps.startedAt ?? new Date();
  return {
    mode: deps.config.mode,
    team: deps.config.team,
    uptimeMs: Date.now() - startedAt.getTime(),
    maxParallel: deps.config.maxParallel,
    claims: deps.db.listClaims().map((c) => ({
      issue: c.identifier,
      sessionId: c.sessionId,
      character: c.character,
      claimedAt: c.claimedAt,
    })),
    sessions: deps.db.listSessions().map((s) => ({
      sessionId: s.id,
      issue: s.issueId,
      character: s.character,
      model: s.model,
      branch: s.branch,
      worktree: s.worktree,
      status: s.status,
      startedAt: s.startedAt,
      endedAt: s.endedAt,
    })),
    validator: deps.validator?.() ?? "unavailable",
    passes: deps.passes?.() ?? [],
    recentEvents: deps.db.listEvents(20).map((e) => ({ kind: e.kind, issue: e.issueId, at: e.at })),
  };
}

export function createHttpServer(deps: StatusDeps): Server {
  return createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    const json = (code: number, body: unknown) => {
      const payload = JSON.stringify(body, null, 2);
      res.writeHead(code, {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      });
      res.end(payload);
    };
    if (req.method !== "GET") return json(405, { error: "method not allowed" });
    if (url.pathname === "/healthz") return json(200, { ok: true, at: new Date().toISOString() });
    if (url.pathname === "/status") return json(200, buildStatus(deps));
    return json(404, { error: "not found", routes: ["/healthz", "/status"] });
  });
}

export async function startHttpServer(deps: StatusDeps): Promise<Server> {
  const server = createHttpServer(deps);
  await new Promise<void>((resolve) => {
    server.listen(deps.config.http.port, deps.config.http.host, resolve);
  });
  return server;
}

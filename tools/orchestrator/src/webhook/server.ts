#!/usr/bin/env tsx
/**
 * Minimal Linear webhook receiver for PAP-93 (`pnpm contract:webhook`), on
 * `node:http` (no framework dependency); PAP-97 replaces it with the full
 * receiver and event bus. Not deployed anywhere yet: the live bounce demo
 * needs a public URL and a Linear webhook subscription (Needs Justin).
 *
 *   POST /webhooks/linear   Linear-Signature = HMAC-SHA256(body, LINEAR_WEBHOOK_SECRET), hex
 *   GET  /healthz
 *
 * Env: LINEAR_API_KEY, LINEAR_WEBHOOK_SECRET (signature check skipped when
 * unset, with a warning), PAPEROS_BOT_ACTOR_IDS (comma-separated),
 * PAPEROS_JUSTIN_ACTOR_ID, PAPEROS_CONTRACT_DB (SQLite path, default
 * `.contract-checks.sqlite`), PORT (default 8787), PAPEROS_CONTRACT_MODE.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { NEEDS_CONTRACT_LABEL } from "../contract/index.js";
import { fetchIssue, toContractIssue } from "../contract/linear-issue.js";
import { openSqliteContractCheckStore } from "../contract/store.js";
import { createLinearClient, rawRequestWithRetry } from "../linear/client.js";
import { loadWorkspaceIds, requireState } from "../linear/workspace.js";
import {
  handleLinearWebhook,
  type LinearOps,
  type LinearWebhookPayload,
  type WebhookDeps,
} from "./handler.js";

export function verifySignature(
  rawBody: string,
  header: string | undefined,
  secret: string,
): boolean {
  if (!header) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(header, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

export function makeLinearOps(client = createLinearClient()): LinearOps {
  return {
    async fetchIssue(id) {
      const node = await fetchIssue(client, id);
      return { ...toContractIssue(node), branchName: node.branchName ?? null };
    },
    async moveToState(issueId, stateId) {
      await rawRequestWithRetry(
        client,
        `mutation($id: String!, $stateId: String!) { issueUpdate(id: $id, input: { stateId: $stateId }) { success } }`,
        { id: issueId, stateId },
      );
    },
    async addLabel(issueId, labelId) {
      await rawRequestWithRetry(
        client,
        `mutation($id: String!, $labelId: String!) { issueAddLabel(id: $id, labelId: $labelId) { success } }`,
        { id: issueId, labelId },
      );
    },
    async comment(issueId, body) {
      await rawRequestWithRetry(
        client,
        `mutation($id: String!, $body: String!) { commentCreate(input: { issueId: $id, body: $body }) { success } }`,
        { id: issueId, body },
      );
    },
    async fetchDependents(issueId) {
      const data = await rawRequestWithRetry<{
        issue: { relations: { nodes: { type: string; relatedIssue: { id: string } }[] } } | null;
      }>(
        client,
        `query($id: String!) { issue(id: $id) { relations { nodes { type relatedIssue { id } } } } }`,
        { id: issueId },
      );
      const ids = (data.issue?.relations.nodes ?? [])
        .filter((r) => r.type === "blocks")
        .map((r) => r.relatedIssue.id);
      const out = [];
      for (const id of ids) {
        const node = await fetchIssue(client, id);
        out.push({ ...toContractIssue(node), branchName: node.branchName ?? null });
      }
      return out;
    },
  };
}

export async function buildDeps(): Promise<WebhookDeps> {
  const ids = await loadWorkspaceIds();
  const stateNamesById: Record<string, string> = {};
  for (const [name, id] of Object.entries(ids.states)) stateNamesById[id] = name;
  const needsContractLabelId = ids.labels[NEEDS_CONTRACT_LABEL];
  if (!needsContractLabelId) {
    console.warn(
      `label "${NEEDS_CONTRACT_LABEL}" missing from linear-workspace.json; bounces will not be labelled`,
    );
  }
  return {
    store: await openSqliteContractCheckStore(
      process.env.PAPEROS_CONTRACT_DB ?? ".contract-checks.sqlite",
    ),
    linear: makeLinearOps(),
    ids: {
      readyStateId: requireState(ids, "Ready for Claude"),
      backlogStateId: requireState(ids, "Backlog"),
      needsContractLabelId,
      stateNamesById,
    },
    actors: {
      botIds: (process.env.PAPEROS_BOT_ACTOR_IDS ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      justinId: process.env.PAPEROS_JUSTIN_ACTOR_ID,
    },
    log: (event, detail) =>
      console.log(JSON.stringify({ event, ...detail, at: new Date().toISOString() })),
  };
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

export function makeRequestHandler(deps: WebhookDeps, secret: string | undefined) {
  return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    if (req.method === "GET" && req.url === "/healthz") {
      res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ ok: true }));
      return;
    }
    if (req.method !== "POST" || req.url !== "/webhooks/linear") {
      res.writeHead(404).end();
      return;
    }
    const raw = await readBody(req);
    if (
      secret &&
      !verifySignature(raw, req.headers["linear-signature"] as string | undefined, secret)
    ) {
      res.writeHead(401).end("bad signature");
      return;
    }
    let payload: LinearWebhookPayload;
    try {
      payload = JSON.parse(raw) as LinearWebhookPayload;
    } catch {
      res.writeHead(400).end("bad json");
      return;
    }
    // Acknowledge fast (Linear retries on slow responses), then act.
    res.writeHead(202).end();
    try {
      const outcome = await handleLinearWebhook(payload, deps);
      deps.log?.("webhook.handled", { outcome });
    } catch (err) {
      deps.log?.("webhook.error", { message: err instanceof Error ? err.message : String(err) });
    }
  };
}

async function main(): Promise<void> {
  const secret = process.env.LINEAR_WEBHOOK_SECRET;
  if (!secret) console.warn("LINEAR_WEBHOOK_SECRET unset: accepting unsigned webhooks (dev only)");
  const deps = await buildDeps();
  const port = Number(process.env.PORT ?? 8787);
  createServer((req, res) => {
    void makeRequestHandler(deps, secret)(req, res);
  }).listen(port, () => console.log(`contract webhook listening on :${port}/webhooks/linear`));
}

const invokedDirectly =
  typeof process.argv[1] === "string" && /webhook\/server\.(ts|js)$/.test(process.argv[1]);
if (invokedDirectly) {
  main().catch((err) => {
    console.error(err instanceof Error ? (err.stack ?? err.message) : err);
    process.exit(1);
  });
}

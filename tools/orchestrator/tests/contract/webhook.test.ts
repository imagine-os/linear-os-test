import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { MemoryContractCheckStore } from "../../src/contract/store.js";
import type { ContractIssue } from "../../src/contract/types.js";
import {
  handleLinearWebhook,
  type LinearOps,
  type LinearWebhookPayload,
  type WebhookDeps,
} from "../../src/webhook/handler.js";
import { makeRequestHandler, verifySignature } from "../../src/webhook/server.js";
import { goodIssue, root } from "./helpers.js";

interface Replay {
  stateIds: Record<string, string>;
  issues: Record<string, ContractIssue>;
  payloads: LinearWebhookPayload[];
}

const replay = JSON.parse(
  readFileSync(resolve(root, "fixtures/contract/webhooks/replay.json"), "utf8"),
) as Replay;
const READY = replay.stateIds["Ready for Claude"] ?? "";
const BACKLOG = replay.stateIds.Backlog ?? "";
const JUSTIN = "8a41ac52-493d-489c-95ff-d3cc7167bad1";
const BOT = "bot-0001";

interface Recorded {
  comments: Map<string, string[]>;
  moves: { issueId: string; stateId: string }[];
  labels: { issueId: string; labelId: string }[];
}

function fakeLinear(
  issues: Record<string, ContractIssue>,
  rec: Recorded,
  dependents?: Record<string, ContractIssue[]>,
): LinearOps {
  return {
    async fetchIssue(id) {
      const i = issues[id];
      if (!i) throw new Error(`no fixture issue ${id}`);
      return { ...i, branchName: `feat/${i.identifier}-fixture` };
    },
    async moveToState(issueId, stateId) {
      rec.moves.push({ issueId, stateId });
    },
    async addLabel(issueId, labelId) {
      rec.labels.push({ issueId, labelId });
    },
    async comment(issueId, body) {
      rec.comments.set(issueId, [...(rec.comments.get(issueId) ?? []), body]);
    },
    ...(dependents ? { fetchDependents: async (id: string) => dependents[id] ?? [] } : {}),
  };
}

function deps(
  issues: Record<string, ContractIssue>,
  rec: Recorded,
  extra: Partial<WebhookDeps> = {},
): WebhookDeps {
  return {
    store: new MemoryContractCheckStore(),
    linear: fakeLinear(issues, rec),
    ids: {
      readyStateId: READY,
      backlogStateId: BACKLOG,
      needsContractLabelId: "label-needs-contract",
      stateNamesById: {
        [READY]: "Ready for Claude",
        [BACKLOG]: "Backlog",
        "st-done": "Done",
        "st-prog": "In Progress",
      },
    },
    actors: { botIds: [BOT], justinId: JUSTIN },
    now: () => new Date("2026-09-19T03:00:00Z"),
    ...extra,
  };
}

const fresh = (): Recorded => ({ comments: new Map(), moves: [], labels: [] });

describe("replay of 30 recorded payloads", () => {
  it("yields exactly one comment per violating issue, none for conforming ones, and ignores the 10 duplicates", async () => {
    const rec = fresh();
    const d = deps(replay.issues, rec);
    const outcomes = [];
    for (const p of replay.payloads) outcomes.push(await handleLinearWebhook(p, d));
    expect(replay.payloads).toHaveLength(30);
    expect(outcomes.filter((o) => o.kind === "duplicate")).toHaveLength(10);
    const acted = outcomes.filter((o) => o.kind !== "duplicate");
    expect(acted).toHaveLength(20);
    for (const [, bodies] of rec.comments) expect(bodies).toHaveLength(1);
    const bounced = acted.filter((o) => o.kind === "bounced");
    const warned = acted.filter((o) => o.kind === "warned");
    const passed = acted.filter((o) => o.kind === "passed");
    // 10 conforming fixtures: the one with a recommended section missing warns, the rest are silent.
    expect(passed.length + warned.length).toBe(10);
    expect(bounced).toHaveLength(10);
    expect(rec.comments.size).toBe(bounced.length + warned.length);
    expect(rec.moves).toHaveLength(10);
    expect(rec.moves.every((m) => m.stateId === BACKLOG)).toBe(true);
    // Readiness-only failures (umbrella, blocked) are bounced without the needs-contract label.
    const readinessOnly = bounced.filter((o) => o.kind === "bounced" && !o.labelled);
    expect(readinessOnly.length).toBeGreaterThan(0);
    expect(rec.labels).toHaveLength(bounced.length - readinessOnly.length);
    // Every check landed in the store.
    for (const o of acted) {
      if ("issue" in o) {
        const id = Object.values(replay.issues).find((i) => i.identifier === o.issue)?.id ?? "";
        expect(d.store.latest(id)).toBeDefined();
      }
    }
  });
});

describe("handler rules", () => {
  const badIssue = Object.values(replay.issues).find((i) => i.identifier === "PAP-9201");
  if (!badIssue) throw new Error("fixture PAP-9201 missing");
  const move = (
    issue: ContractIssue,
    actor: string,
    overrides: Partial<LinearWebhookPayload> = {},
  ): LinearWebhookPayload => ({
    action: "update",
    type: "Issue",
    webhookId: `w-${Math.random()}`,
    actor: { id: actor, name: "x" },
    data: {
      id: issue.id,
      identifier: issue.identifier,
      stateId: READY,
      state: { id: READY, name: "Ready for Claude" },
    },
    updatedFrom: { stateId: BACKLOG },
    ...overrides,
  });

  it("last actor is Justin: comment, never move or label", async () => {
    const rec = fresh();
    const out = await handleLinearWebhook(
      move(badIssue, JUSTIN),
      deps({ [badIssue.id]: badIssue }, rec),
    );
    expect(out).toMatchObject({ kind: "commented", reason: "justin", codes: ["MISSING_SECTION"] });
    expect(rec.moves).toEqual([]);
    expect(rec.labels).toEqual([]);
    expect(rec.comments.get(badIssue.id)?.[0]).toContain("last actor is Justin");
  });

  it("ignores its own bot actor, non-Issue events, updates without a state change and moves elsewhere", async () => {
    const rec = fresh();
    const d = deps({ [badIssue.id]: badIssue }, rec);
    expect(await handleLinearWebhook(move(badIssue, BOT), d)).toMatchObject({
      kind: "ignored",
      reason: "own actor",
    });
    expect(await handleLinearWebhook({ ...move(badIssue, "u"), type: "Comment" }, d)).toMatchObject(
      { kind: "ignored" },
    );
    expect(
      await handleLinearWebhook({ ...move(badIssue, "u"), updatedFrom: { title: "old" } }, d),
    ).toMatchObject({ kind: "ignored", reason: "state unchanged" });
    expect(
      await handleLinearWebhook({ ...move(badIssue, "u"), updatedFrom: null }, d),
    ).toMatchObject({ kind: "ignored" });
    expect(
      await handleLinearWebhook(
        {
          ...move(badIssue, "u"),
          data: {
            id: badIssue.id,
            stateId: "st-prog",
            state: { id: "st-prog", name: "In Progress" },
          },
        },
        d,
      ),
    ).toMatchObject({ kind: "ignored", reason: "moved to In Progress" });
    expect(rec.comments.size).toBe(0);
  });

  it("logs and skips the label when needs-contract is not in the workspace file; a passing issue is silent", async () => {
    const rec = fresh();
    const events: string[] = [];
    const d = deps({ [badIssue.id]: badIssue }, rec, { log: (e) => events.push(e) });
    d.ids.needsContractLabelId = undefined;
    const out = await handleLinearWebhook(move(badIssue, "u"), d);
    expect(out).toMatchObject({ kind: "bounced", labelled: false });
    expect(events).toContain("contract.label_missing");
    expect(rec.labels).toEqual([]);
    const ok = goodIssue({ state: { name: "Ready for Claude" } });
    const rec2 = fresh();
    expect(await handleLinearWebhook(move(ok, "u"), deps({ [ok.id]: ok }, rec2))).toMatchObject({
      kind: "passed",
    });
    expect(rec2.comments.size).toBe(0);
  });

  it("falls back to a synthetic id when webhookId is absent and resolves state names from ids", async () => {
    const rec = fresh();
    const d = deps({ [badIssue.id]: badIssue }, rec);
    const p = move(badIssue, "u", { webhookId: undefined, createdAt: "2026-09-19T03:00:00Z" });
    p.data = { id: badIssue.id, stateId: READY };
    expect(await handleLinearWebhook(p, d)).toMatchObject({ kind: "bounced" });
    expect(await handleLinearWebhook(p, d)).toMatchObject({ kind: "duplicate" });
  });

  it("a blocker regressing from Done to In Progress re-validates Ready dependents and bounces them with READY_BUT_BLOCKED", async () => {
    const rec = fresh();
    const blocker = goodIssue({
      id: "blk-1",
      identifier: "PAP-9500",
      state: { name: "In Progress" },
    });
    const dependent = goodIssue({
      id: "dep-1",
      identifier: "PAP-9501",
      state: { name: "Ready for Claude" },
      blockedBy: [{ identifier: "PAP-9500", state: { name: "In Progress" } }],
    });
    const backlogDependent = goodIssue({
      id: "dep-2",
      identifier: "PAP-9502",
      blockedBy: dependent.blockedBy,
    });
    const d = deps({ [blocker.id]: blocker, [dependent.id]: dependent }, rec);
    d.linear = fakeLinear({ [blocker.id]: blocker, [dependent.id]: dependent }, rec, {
      [blocker.id]: [dependent, backlogDependent],
    });
    const p: LinearWebhookPayload = {
      action: "update",
      type: "Issue",
      webhookId: "w-regress",
      actor: { id: "u" },
      data: {
        id: blocker.id,
        identifier: blocker.identifier,
        stateId: "st-prog",
        state: { id: "st-prog", name: "In Progress" },
      },
      updatedFrom: { stateId: "st-done" },
    };
    const out = await handleLinearWebhook(p, d);
    expect(out).toMatchObject({ kind: "revalidated", blocker: "PAP-9500", bounced: ["PAP-9501"] });
    expect(rec.moves).toEqual([{ issueId: "dep-1", stateId: BACKLOG }]);
    expect(rec.labels).toEqual([]);
    expect(rec.comments.get("dep-1")?.[0]).toContain("READY_BUT_BLOCKED");
    // Without a dependents lookup the regression is only noted.
    const d2 = deps({ [blocker.id]: blocker }, fresh());
    expect(await handleLinearWebhook({ ...p, webhookId: "w-regress-2" }, d2)).toMatchObject({
      kind: "ignored",
    });
    // A move from Backlog to In Progress is not a regression.
    expect(
      await handleLinearWebhook(
        { ...p, webhookId: "w-regress-3", updatedFrom: { stateId: BACKLOG } },
        d,
      ),
    ).toMatchObject({ kind: "ignored", reason: "moved to In Progress" });
  });
});

describe("receiver", () => {
  it("verifySignature accepts the HMAC hex of the raw body and rejects anything else", async () => {
    const { createHmac } = await import("node:crypto");
    const body = '{"a":1}';
    const sig = createHmac("sha256", "s3cret").update(body).digest("hex");
    expect(verifySignature(body, sig, "s3cret")).toBe(true);
    expect(verifySignature(body, "00", "s3cret")).toBe(false);
    expect(verifySignature(body, undefined, "s3cret")).toBe(false);
  });

  it("routes /healthz, rejects bad signatures and bad JSON, and 202s a valid delivery", async () => {
    const { createServer } = await import("node:http");
    const { createHmac } = await import("node:crypto");
    const rec = fresh();
    const badIssue = Object.values(replay.issues).find((i) => i.identifier === "PAP-9201");
    if (!badIssue) throw new Error("fixture missing");
    const events: unknown[] = [];
    const d = deps({ [badIssue.id]: badIssue }, rec, {
      log: (e, detail) => events.push({ e, detail }),
    });
    const handler = makeRequestHandler(d, "s3cret");
    const server = createServer((req, res) => {
      void handler(req, res);
    });
    await new Promise<void>((r) => server.listen(0, r));
    const addr = server.address();
    const port = typeof addr === "object" && addr ? addr.port : 0;
    const url = (p: string) => `http://127.0.0.1:${port}${p}`;
    expect((await fetch(url("/healthz"))).status).toBe(200);
    expect((await fetch(url("/nope"))).status).toBe(404);
    const payload = JSON.stringify(replay.payloads[10]);
    expect((await fetch(url("/webhooks/linear"), { method: "POST", body: payload })).status).toBe(
      401,
    );
    const sign = (b: string) => createHmac("sha256", "s3cret").update(b).digest("hex");
    expect(
      (
        await fetch(url("/webhooks/linear"), {
          method: "POST",
          body: "{",
          headers: { "linear-signature": sign("{") },
        })
      ).status,
    ).toBe(400);
    const res = await fetch(url("/webhooks/linear"), {
      method: "POST",
      body: payload,
      headers: { "linear-signature": sign(payload) },
    });
    expect(res.status).toBe(202);
    await new Promise((r) => setTimeout(r, 50));
    expect(events.some((x) => (x as { e: string }).e === "webhook.handled")).toBe(true);
    await new Promise<void>((r) => server.close(() => r()));
  });
});

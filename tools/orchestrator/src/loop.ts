/**
 * The poll cycle (PAP-281).
 *
 * One cycle is: recover anything a crash left behind (first cycle only) →
 * claim up to `maxParallel` free slots → hand each claim to the launcher →
 * run every registered pass in registration order. `registerPass(name, fn)`
 * is the plug-in point PAP-96's round-4 amendment asks for: PAP-691's
 * promotion pass and PAP-703's SLA evaluator attach to the cycle without
 * anything in this file changing.
 *
 * Failure policy (PAP-96 edge case "Linear API down"): a throwing cycle never
 * kills the loop. Claiming pauses, the delay grows by `backoff.factor` up to
 * `backoff.maxMs`, and the first clean cycle resets it. Running sessions are
 * untouched — they do not depend on this loop being awake.
 *
 * `wake()` short-circuits the wait so PAP-97's webhook receiver can make the
 * loop react in under a second instead of within `pollIntervalMs`.
 */

import type { LinearClient } from "@linear/sdk";
import type { OrchestratorConfig } from "./config.js";
import type { OrchestratorDb } from "./db/index.js";
import type { EventBus } from "./events.js";
import { type Claim, type ClaimDeps, claimNextDetailed, recoverClaims } from "./linear/claim.js";
import type { WorkspaceIds } from "./linear/workspace.js";
import { DryRunLauncher, type SessionLauncher } from "./session/launcher.js";

export interface PassContext {
  config: OrchestratorConfig;
  client: LinearClient;
  db: OrchestratorDb;
  ids: WorkspaceIds;
  events: EventBus;
  /** Claims made in this cycle, so a pass can react to them. */
  claimed: Claim[];
  /** Cycle number since start, 0-based. */
  cycle: number;
}

export type Pass = (ctx: PassContext) => Promise<void> | void;

export interface CycleReport {
  cycle: number;
  claimed: string[];
  skipped: { identifier: string; reason: string }[];
  passes: string[];
  errors: { where: string; message: string }[];
  durationMs: number;
}

export interface LoopDeps {
  config: OrchestratorConfig;
  client: LinearClient;
  db: OrchestratorDb;
  ids: WorkspaceIds;
  events: EventBus;
  launcher?: SessionLauncher;
  /** Injected by PAP-99 to replace FIFO ordering. */
  pickNext?: ClaimDeps["pickNext"];
  /** Test seams, forwarded to `claimNext`. */
  fetchReady?: ClaimDeps["fetchReady"];
  refetch?: ClaimDeps["refetch"];
  now?: () => Date;
  log?: (message: string) => void;
  /** Injected in tests so the loop does not really sleep. */
  sleep?: (ms: number) => Promise<void>;
  worktreeRoot?: string;
}

export interface Loop {
  /** Run exactly one cycle and return what happened. */
  runCycle(): Promise<CycleReport>;
  /** Run cycles until `stop()`; resolves when the loop has stopped. */
  start(): Promise<void>;
  stop(): void;
  /** Cut the current wait short (PAP-97 webhooks). */
  wake(): void;
  registerPass(name: string, fn: Pass): () => void;
  readonly passes: string[];
  readonly running: boolean;
}

export function createLoop(deps: LoopDeps): Loop {
  const log = deps.log ?? ((m: string) => console.log(m));
  const sleep =
    deps.sleep ??
    ((ms: number) =>
      new Promise<void>((resolve) => {
        const t = setTimeout(resolve, ms);
        t.unref?.();
      }));
  const launcher = deps.launcher ?? new DryRunLauncher(log);
  const passes: { name: string; fn: Pass }[] = [];

  let stopped = false;
  let running = false;
  let cycle = 0;
  let recovered = false;
  let backoffMs = 0;
  let waker: (() => void) | null = null;

  const claimDeps: ClaimDeps = {
    client: deps.client,
    db: deps.db,
    ids: deps.ids,
    events: deps.events,
    config: deps.config,
    pickNext: deps.pickNext,
    fetchReady: deps.fetchReady,
    refetch: deps.refetch,
    now: deps.now,
    log,
  };

  function freeSlots(): number {
    const held = deps.db.listClaims().length;
    return Math.max(0, deps.config.maxParallel - held);
  }

  async function runCycle(): Promise<CycleReport> {
    const started = Date.now();
    const report: CycleReport = {
      cycle,
      claimed: [],
      skipped: [],
      passes: [],
      errors: [],
      durationMs: 0,
    };

    if (!recovered) {
      recovered = true;
      const { released, interrupted } = recoverClaims(claimDeps);
      if (released.length > 0) {
        log(
          `loop: restart recovery released ${released.join(", ")}` +
            (interrupted.length > 0 ? ` (interrupted: ${interrupted.join(", ")})` : ""),
        );
      }
    }

    const claimedThisCycle: Claim[] = [];
    try {
      for (let slot = freeSlots(); slot > 0; slot--) {
        const attempt = await claimNextDetailed(claimDeps);
        report.skipped.push(...attempt.skipped);
        if (!attempt.claim) break;
        claimedThisCycle.push(attempt.claim);
        report.claimed.push(attempt.claim.identifier);
        try {
          const result = await launcher.launch(attempt.claim, {
            baseBranches: [],
            model: null,
            worktreeRoot: deps.worktreeRoot ?? "/workspace/wt",
          });
          deps.db.updateSession(attempt.claim.sessionId, {
            status: result.status === "running" ? "running" : "claimed",
            worktree: result.worktree ?? null,
            branch: result.branch ?? null,
          });
          if (result.status === "running") {
            deps.events.emit("session.started", {
              sessionId: attempt.claim.sessionId,
              issueId: attempt.claim.issueId,
              character: attempt.claim.character,
            });
          }
        } catch (err) {
          report.errors.push({ where: "launch", message: (err as Error).message });
        }
      }
      backoffMs = 0;
    } catch (err) {
      const message = (err as Error).message;
      backoffMs = nextBackoff(backoffMs, deps.config);
      report.errors.push({ where: "claim", message });
      deps.events.emit("loop.error", { where: "claim", message, backoffMs });
      log(`loop: claim pass failed (${message}); backing off ${backoffMs} ms`);
    }

    for (const pass of passes) {
      try {
        await pass.fn({
          config: deps.config,
          client: deps.client,
          db: deps.db,
          ids: deps.ids,
          events: deps.events,
          claimed: claimedThisCycle,
          cycle,
        });
        report.passes.push(pass.name);
      } catch (err) {
        const message = (err as Error).message;
        report.errors.push({ where: `pass:${pass.name}`, message });
        deps.events.emit("loop.error", { where: `pass:${pass.name}`, message, backoffMs });
        log(`loop: pass "${pass.name}" failed: ${message}`);
      }
    }

    report.durationMs = Date.now() - started;
    cycle += 1;
    deps.events.emit("loop.cycle", {
      claimed: report.claimed.length,
      passes: report.passes,
      durationMs: report.durationMs,
    });
    return report;
  }

  async function waitForNextCycle(): Promise<void> {
    const delay = backoffMs > 0 ? backoffMs : deps.config.pollIntervalMs;
    await Promise.race([
      sleep(delay),
      new Promise<void>((resolve) => {
        waker = resolve;
      }),
    ]);
    waker = null;
  }

  return {
    async runCycle() {
      return runCycle();
    },
    async start() {
      if (running) return;
      running = true;
      stopped = false;
      while (!stopped) {
        await runCycle();
        if (stopped) break;
        await waitForNextCycle();
      }
      running = false;
    },
    stop() {
      stopped = true;
      waker?.();
    },
    wake() {
      waker?.();
    },
    registerPass(name: string, fn: Pass) {
      if (passes.some((p) => p.name === name)) {
        throw new Error(`a pass named "${name}" is already registered`);
      }
      passes.push({ name, fn });
      return () => {
        const i = passes.findIndex((p) => p.name === name);
        if (i >= 0) passes.splice(i, 1);
      };
    },
    get passes() {
      return passes.map((p) => p.name);
    },
    get running() {
      return running;
    },
  };
}

export function nextBackoff(current: number, config: OrchestratorConfig): number {
  const next = current === 0 ? config.backoff.initialMs : current * config.backoff.factor;
  return Math.min(Math.round(next), config.backoff.maxMs);
}

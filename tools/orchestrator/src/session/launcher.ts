/**
 * `launchSession` as a port (PAP-281 build-loop adaptation).
 *
 * The real launch — worktree, prompt rendering, the Claude Code SDK stream —
 * is PAP-282. This issue owns the claim, so it owns the seam: the loop calls
 * a `SessionLauncher`, and PAP-282 registers the real one without editing
 * `loop.ts`. `DryRunLauncher` is the default and only logs, which is what
 * makes `pnpm orchestrator:loop` safe to run on the live team today.
 */

import type { Claim } from "../linear/claim.js";

export interface LaunchContext {
  /** From PAP-691 promotion; empty in build-loop mode. */
  baseBranches: string[];
  /** Resolved by PAP-704 `resolveModel()` once it lands; null until then. */
  model: string | null;
  worktreeRoot: string;
}

export interface LaunchResult {
  sessionId: string;
  status: "running" | "skipped" | "failed";
  worktree?: string;
  branch?: string;
  detail?: string;
}

export interface SessionLauncher {
  readonly name: string;
  launch(claim: Claim, context: LaunchContext): Promise<LaunchResult>;
}

/** Logs what it would do and nothing else. No git, no SDK, no Linear. */
export class DryRunLauncher implements SessionLauncher {
  readonly name = "dry-run";

  constructor(private readonly log: (message: string) => void = console.log) {}

  async launch(claim: Claim, context: LaunchContext): Promise<LaunchResult> {
    const branch = claim.issue.branchName ?? `feat/${claim.identifier}`;
    const worktree = `${context.worktreeRoot}/${claim.identifier}`;
    this.log(
      `[dry-run] would launch ${claim.character} on ${claim.identifier} — ` +
        `worktree ${worktree}, branch ${branch}, model ${context.model ?? "(PAP-704 pending)"}` +
        (context.baseBranches.length > 0
          ? `, BASE_BRANCHES=${context.baseBranches.join(",")}`
          : ""),
    );
    return {
      sessionId: claim.sessionId,
      status: "skipped",
      worktree,
      branch,
      detail: "DryRunLauncher: PAP-282 provides the real launcher",
    };
  }
}

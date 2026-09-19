/**
 * Validator configuration (PAP-93). Every knob the spec calls "in config".
 */

/**
 * `pr-flow` is the plan's target mode: an `In Review` blocker is closed only
 * with an open PR (branch-start rule). `build-loop` is the 2026-09-19 org
 * policy (git only, no PRs; `In Review` means pushed to main with a Session
 * ended comment), so an `In Review` blocker counts as closed without a PR
 * check. See docs/pm/session-playbook.md §8.
 */
export type ContractMode = "build-loop" | "pr-flow";

export interface ContractConfig {
  mode: ContractMode;
  /** ISO date (UTC) from which `NO_SPEC_LINK` is an error instead of a warning. */
  strictSpecLinkFrom: string;
  /** Descriptions longer than this are truncated before parsing and flagged. */
  maxDescriptionChars: number;
  /** When true, a missing `Character/*` label warns (`LABEL_CHARACTER`); PAP-91 has landed. */
  characterLabelWarn: boolean;
  /** Clock, injectable for tests. */
  now: () => Date;
}

export const DEFAULT_CONFIG: ContractConfig = {
  mode: (process.env.PAPEROS_CONTRACT_MODE as ContractMode | undefined) ?? "build-loop",
  strictSpecLinkFrom: process.env.PAPEROS_SPEC_LINK_STRICT_FROM ?? "2026-09-22",
  maxDescriptionChars: 50_000,
  characterLabelWarn: true,
  now: () => new Date(),
};

export function resolveConfig(partial?: Partial<ContractConfig>): ContractConfig {
  const cfg = { ...DEFAULT_CONFIG, ...partial };
  if (cfg.mode !== "build-loop" && cfg.mode !== "pr-flow") {
    throw new Error(`contract mode must be "build-loop" or "pr-flow", got "${String(cfg.mode)}"`);
  }
  return cfg;
}

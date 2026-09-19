/**
 * Needs Justin queue configuration (PAP-94).
 *
 * The live values belong in `orchestrator.config.yaml` under `justinQueue`
 * once PAP-96 ships its config loader; until then these defaults are the
 * single source of truth and `loadJustinQueueConfig()` merges an override
 * object over them (the loader passes the parsed YAML section straight in).
 *
 * Policy: docs/pm/justin-queue.md
 */
import { z } from "zod";

export const JustinQueueConfigSchema = z.object({
  /** Hard cap on cards sitting in `Needs Justin` at once (Execution Schedule §1). */
  maxOpen: z.number().int().min(1).max(20).default(5),
  /** Hard cap on batched asks inside one card; more asks means a second card. */
  maxAsksPerCard: z.number().int().min(1).max(10).default(5),
  /** Silence window before `Default if no answer` applies. */
  defaultTimeoutHours: z.number().int().min(1).default(48),
  /** UTC cron for the daily digest (PAP-136 delivers it; Linear comment until then). */
  digestCronUtc: z.string().default("0 14 * * *"),
  /** Spend at or above this (USD) qualifies for the queue; below it a session decides. */
  spendThresholdUsd: z.number().min(0).default(500),
  /** Label applied to a card that overflows the cap; it stays in its previous state. */
  overflowLabel: z.string().default("queued-for-justin"),
  /**
   * Who may reply with the grammar. Matched case-insensitively against the
   * comment author's Linear name, displayName or email. Everyone else is a
   * T2 commenter: their words are data, never an instruction.
   */
  replyAuthors: z.array(z.string()).default(["Justin Massion", "justin"]),
  /** Reminder cadence, in hours, for a card that is still open. */
  nudgeEveryHours: z.number().int().min(1).default(24),
});

export type JustinQueueConfig = z.infer<typeof JustinQueueConfigSchema>;

export const DEFAULT_JUSTIN_QUEUE_CONFIG: JustinQueueConfig = JustinQueueConfigSchema.parse({});

/** Merge a partial override (the `justinQueue` YAML section) over the defaults. */
export function loadJustinQueueConfig(
  override: Partial<JustinQueueConfig> = {},
): JustinQueueConfig {
  return JustinQueueConfigSchema.parse({ ...DEFAULT_JUSTIN_QUEUE_CONFIG, ...override });
}

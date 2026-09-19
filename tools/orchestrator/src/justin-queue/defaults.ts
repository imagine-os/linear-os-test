/**
 * What happens on silence (PAP-94).
 *
 * Every card states what happens if nobody answers. After
 * `defaultTimeoutHours` (48 by default) that default applies by itself, the
 * card closes as `defaulted` and the slot frees. The exception is a hard
 * block: it never auto-applies, it waits and is nudged, because no default is
 * safe for it.
 *
 * Policy: docs/pm/justin-queue.md
 */
import { ageHours, type DecisionCard, isCardOpen, isHardBlock, type QueueEntry } from "./card.js";
import { DEFAULT_JUSTIN_QUEUE_CONFIG, type JustinQueueConfig } from "./config.js";
import type { Decision } from "./parse-reply.js";

export type Disposition =
  | {
      action: "apply-default";
      card: DecisionCard;
      /** One `approve`-by-default decision per non-hard-block ask. */
      decisions: Decision[];
      /** The card-level default, quoted in the acknowledgement. */
      summary: string;
      ageHours: number;
    }
  | {
      action: "hold";
      card: DecisionCard;
      reason: "hard-block";
      /** Hard blocks are nudged, never defaulted. */
      nudge: boolean;
      ageHours: number;
    }
  | {
      action: "wait";
      card: DecisionCard;
      /** Hours left before the default applies. */
      dueInHours: number;
      nudge: boolean;
      ageHours: number;
    };

/** When the default applies: the 48 h window, or the card's own earlier deadline. */
export function defaultAppliesAt(
  card: DecisionCard,
  config: JustinQueueConfig = DEFAULT_JUSTIN_QUEUE_CONFIG,
): Date {
  const window = new Date(
    new Date(card.openedAt).getTime() + config.defaultTimeoutHours * 3_600_000,
  );
  if (!card.deadline) return window;
  const deadline = new Date(card.deadline);
  return deadline < window ? deadline : window;
}

function shouldNudge(entry: QueueEntry, now: Date, config: JustinQueueConfig): boolean {
  const since = entry.lastNudgeAt ? new Date(entry.lastNudgeAt) : new Date(entry.card.openedAt);
  return now.getTime() - since.getTime() >= config.nudgeEveryHours * 3_600_000;
}

/**
 * Disposition of every open card at `now`. Pure and clock-injected, so the
 * fake-clock tests and the real 30 s poll run the same code.
 */
export function defaults(
  queue: readonly QueueEntry[],
  now: Date = new Date(),
  config: JustinQueueConfig = DEFAULT_JUSTIN_QUEUE_CONFIG,
): Disposition[] {
  const out: Disposition[] = [];
  for (const entry of queue) {
    const card = entry.card;
    if (!isCardOpen(card)) continue;
    const age = ageHours(card, now);
    const due = defaultAppliesAt(card, config);
    const expired = now.getTime() >= due.getTime();

    if (!expired) {
      out.push({
        action: "wait",
        card,
        dueInHours: (due.getTime() - now.getTime()) / 3_600_000,
        nudge: shouldNudge(entry, now, config),
        ageHours: age,
      });
      continue;
    }
    if (isHardBlock(card)) {
      out.push({
        action: "hold",
        card,
        reason: "hard-block",
        nudge: shouldNudge(entry, now, config),
        ageHours: age,
      });
      continue;
    }
    out.push({
      action: "apply-default",
      card,
      decisions: card.asks
        .filter((a) => !a.hardBlock)
        .map((a) => ({
          verb: "approve" as const,
          target: a.id,
          reason: a.default,
          source: "default" as const,
          raw: `default after ${config.defaultTimeoutHours}h: ${a.default}`,
        })),
      summary: card.defaultIfNoAnswer,
      ageHours: age,
    });
  }
  return out;
}

/** Applies a disposition to the queue entry, returning the closed card. */
export function applyDefault(entry: QueueEntry, disposition: Disposition): QueueEntry {
  if (disposition.action !== "apply-default") return entry;
  return {
    ...entry,
    card: {
      ...entry.card,
      status: "defaulted",
      asks: entry.card.asks.map((a) => (a.hardBlock ? a : { ...a, status: "defaulted" as const })),
    },
  };
}

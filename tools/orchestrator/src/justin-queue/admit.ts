/**
 * Admission control for the Needs Justin queue (PAP-94).
 *
 * Three gates, in order: does this genuinely need the human, is it already
 * asked, and is there a free slot in the five. Nothing reaches Justin that
 * fails the first, nothing is asked twice, and the sixth card waits with the
 * `queued-for-justin` label instead of enlarging his queue.
 *
 * Policy: docs/pm/justin-queue.md
 */
import {
  type DecisionCard,
  DecisionCardSchema,
  isCardOpen,
  type QueueEntry,
  REFUSED_CATEGORIES,
  type RefusedCategory,
} from "./card.js";
import { DEFAULT_JUSTIN_QUEUE_CONFIG, type JustinQueueConfig } from "./config.js";

export const REFUSAL_CODES = [
  "INVALID_CARD",
  "NOT_A_HUMAN_DECISION",
  "BELOW_SPEND_THRESHOLD",
  "NO_DEFAULT",
  "TOO_MANY_ASKS",
] as const;
export type RefusalCode = (typeof REFUSAL_CODES)[number];

export type AdmissionResult =
  | {
      outcome: "admitted";
      card: DecisionCard;
      /** Open cards after this one was admitted, including it. */
      openAfter: number;
      /** Key of the non-urgent card bumped to make room, when one was. */
      bumped?: string;
    }
  | {
      outcome: "queued";
      card: DecisionCard;
      reason: "cap";
      label: string;
      /** Where the card sits in the waiting line (1 = next in). */
      position: number;
    }
  | {
      outcome: "deduped";
      /** Key of the open card this ask was merged into. */
      into: string;
      /** Ask ids added to that card; empty when every ask was already there. */
      merged: string[];
    }
  | { outcome: "refused"; code: RefusalCode; reason: string };

const REFUSED_SET = new Set<string>(REFUSED_CATEGORIES);

/** Human-readable reason per refused category, quoted back to the filer. */
const REFUSAL_REASONS: Record<RefusedCategory, string> = {
  "code-review": "code review is Sentinel's gate, not a human decision",
  "test-failure": "a failing test is fixed or filed, never approved",
  "library-choice": "the PAP-209 evaluation rubric decides library choices",
  "already-decided": "a spec, ADR, rubric or the roster already decides this",
  "has-safe-default": "record the default in the handoff and proceed",
  "estimate-or-schedule": "Atlas re-simulates the schedule; Justin does not size work",
};

function openEntries(queue: readonly QueueEntry[]): QueueEntry[] {
  return queue.filter((e) => isCardOpen(e.card));
}

/**
 * Decides what happens to a proposed card. Pure: it mutates nothing and
 * performs no I/O, so the orchestrator can dry-run the whole queue.
 *
 * @param input  the proposed card, unvalidated (it may come from YAML)
 * @param queue  every card the queue knows about, open and queued
 * @param now    the clock, injected so tests can fake it
 */
export function admit(
  input: unknown,
  queue: readonly QueueEntry[] = [],
  now: Date = new Date(),
  config: JustinQueueConfig = DEFAULT_JUSTIN_QUEUE_CONFIG,
): AdmissionResult {
  // Gate 0: a refused category never becomes a card, whatever else it says.
  const category = (input as { category?: unknown } | null)?.category;
  if (typeof category === "string" && REFUSED_SET.has(category)) {
    return {
      outcome: "refused",
      code: "NOT_A_HUMAN_DECISION",
      reason: REFUSAL_REASONS[category as RefusedCategory],
    };
  }

  const asks = (input as { asks?: unknown } | null)?.asks;
  if (Array.isArray(asks) && asks.length > config.maxAsksPerCard) {
    return {
      outcome: "refused",
      code: "TOO_MANY_ASKS",
      reason: `a card batches at most ${config.maxAsksPerCard} asks; split it into two cards`,
    };
  }

  const parsed = DecisionCardSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const where = first?.path.join(".") ?? "card";
    return {
      outcome: "refused",
      code: "INVALID_CARD",
      reason: `${where}: ${first?.message ?? "does not match the card schema"}`,
    };
  }
  const card = parsed.data;

  // Gate 1: spend below the threshold is a session's own call.
  if (card.category === "spend" && (card.spendUsd ?? 0) < config.spendThresholdUsd) {
    return {
      outcome: "refused",
      code: "BELOW_SPEND_THRESHOLD",
      reason: `$${card.spendUsd ?? 0} is under the $${config.spendThresholdUsd} threshold`,
    };
  }

  // Gate 1b: every ask carries a default unless it is explicitly a hard block.
  const undefaulted = card.asks.find((a) => !a.hardBlock && a.default.trim().length === 0);
  if (undefaulted) {
    return {
      outcome: "refused",
      code: "NO_DEFAULT",
      reason: `ask ${undefaulted.id} has no default and is not marked hardBlock`,
    };
  }

  // Gate 2: dedupe by key. Same subject, same card; new asks merge into it.
  const twin = queue.find((e) => e.card.key === card.key && !isClosedStatus(e.card.status));
  if (twin) {
    const have = new Set(twin.card.asks.map((a) => a.id));
    const merged = card.asks.filter((a) => !have.has(a.id)).map((a) => a.id);
    return { outcome: "deduped", into: twin.card.key, merged };
  }

  // Gate 3: the cap. An urgent card bumps the oldest non-urgent one; anything
  // else waits with the overflow label, in its previous state.
  const open = openEntries(queue);
  if (open.length < config.maxOpen) {
    return { outcome: "admitted", card: { ...card, status: "open" }, openAfter: open.length + 1 };
  }

  if (card.urgent) {
    const victim = [...open]
      .filter((e) => !e.card.urgent)
      .sort((a, b) => Date.parse(a.card.openedAt) - Date.parse(b.card.openedAt))[0];
    if (victim) {
      return {
        outcome: "admitted",
        card: { ...card, status: "open", openedAt: now.toISOString() },
        openAfter: open.length,
        bumped: victim.card.key,
      };
    }
  }

  const waiting = queue.filter((e) => e.card.status === "queued").length;
  return {
    outcome: "queued",
    card: { ...card, status: "queued" },
    reason: "cap",
    label: config.overflowLabel,
    position: waiting + 1,
  };
}

function isClosedStatus(status: DecisionCard["status"]): boolean {
  return (
    status === "approved" ||
    status === "rejected" ||
    status === "defaulted" ||
    status === "withdrawn"
  );
}

/**
 * Called when a card resolves and a slot frees. Returns the queued cards that
 * move into `Needs Justin`, highest priority first, then oldest first — the
 * order the spec names.
 */
export function admitNext(
  queue: readonly QueueEntry[],
  config: JustinQueueConfig = DEFAULT_JUSTIN_QUEUE_CONFIG,
): DecisionCard[] {
  const free = config.maxOpen - openEntries(queue).length;
  if (free <= 0) return [];
  return queue
    .filter((e) => e.card.status === "queued")
    .sort(
      (a, b) =>
        a.card.priority - b.card.priority ||
        Date.parse(a.queuedAt ?? a.card.openedAt) - Date.parse(b.queuedAt ?? b.card.openedAt),
    )
    .slice(0, free)
    .map((e) => ({ ...e.card, status: "open" as const }));
}

/** How many of the five slots are taken. Used by the digest and `--check`. */
export function slotsUsed(
  queue: readonly QueueEntry[],
  config: JustinQueueConfig = DEFAULT_JUSTIN_QUEUE_CONFIG,
): { open: number; max: number; queued: number; overflow: boolean } {
  const open = openEntries(queue).length;
  return {
    open,
    max: config.maxOpen,
    queued: queue.filter((e) => e.card.status === "queued").length,
    overflow: open > config.maxOpen,
  };
}

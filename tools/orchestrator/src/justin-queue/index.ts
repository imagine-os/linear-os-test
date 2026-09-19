/**
 * The Needs Justin queue (PAP-94): admission, batching, the reply grammar and
 * what happens on silence. Policy: docs/pm/justin-queue.md.
 *
 * Everything exported here is pure and clock-injected. The Linear side (the
 * 30 s comment poll of PAP-97, the state moves, the 14:00 UTC digest) lands
 * with PAP-96/PAP-97 and calls these functions; `src/cli/justin-queue.ts` is
 * the read-only operator view until then.
 */
export * from "./admit.js";
export * from "./card.js";
export * from "./config.js";
export * from "./defaults.js";
export * from "./parse-reply.js";
export * from "./render.js";
export * from "./resolve.js";

import { type AdmissionResult, admit } from "./admit.js";
import type { DecisionCard, QueueEntry } from "./card.js";

/**
 * `requestDecision` from the spec's interface contract, in its pure form: it
 * returns what the queue would do with the card. The writing half (create the
 * comment, move the issue to `Needs Justin`, apply `queued-for-justin`) is
 * PAP-96's job and is **not wired yet** — callers today log the result.
 */
export function requestDecision(
  card: unknown,
  queue: readonly QueueEntry[] = [],
  now: Date = new Date(),
): AdmissionResult {
  return admit(card, queue, now);
}

/** Convenience for the digest: the open cards, oldest first. */
export function openCards(queue: readonly QueueEntry[]): DecisionCard[] {
  return queue
    .filter((e) => e.card.status === "open")
    .map((e) => e.card)
    .sort((a, b) => Date.parse(a.openedAt) - Date.parse(b.openedAt));
}

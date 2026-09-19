/**
 * Turning a parsed reply into a queue change (PAP-94).
 *
 * Pure: it returns the new entry and the acknowledgement text; the caller
 * writes to Linear. A reply on a closed card is acknowledged and ignored, as
 * the spec's edge case requires.
 *
 * Policy: docs/pm/justin-queue.md
 */
import { type CardStatus, isClosed, type QueueEntry } from "./card.js";
import type { Decision, ParsedReply } from "./parse-reply.js";

export interface Resolution {
  entry: QueueEntry;
  /** True when the reply changed the card. */
  changed: boolean;
  /** Comment to post back; always non-empty for an authorised reply. */
  acknowledgement: string;
  /** Linear state the issue moves to, or undefined to leave it. */
  moveTo?: "Ready for Claude" | "Backlog" | "Needs Justin";
}

const VERB_STATUS: Record<Decision["verb"], CardStatus | undefined> = {
  approve: "approved",
  reject: "rejected",
  option: "approved",
  defer: "deferred",
  ask: undefined,
};

function targets(entry: QueueEntry, decision: Decision): boolean {
  if (!decision.target) return true;
  const t = decision.target.toUpperCase();
  return t === entry.card.nj || t === entry.card.issue || entry.card.asks.some((a) => a.id === t);
}

/** Applies one parsed comment to one queue entry. */
export function applyReply(entry: QueueEntry, reply: ParsedReply, now: Date): Resolution {
  if (!reply.authorized) {
    return { entry, changed: false, acknowledgement: "" };
  }
  const mine = reply.decisions.filter((d) => targets(entry, d));
  if (mine.length === 0) {
    return {
      entry,
      changed: false,
      acknowledgement: reply.clarification ?? "",
    };
  }
  if (isClosed(entry.card)) {
    return {
      entry,
      changed: false,
      acknowledgement: `${entry.card.nj} is already ${entry.card.status}; noted and ignored.`,
    };
  }

  let card = entry.card;
  const lines: string[] = [];
  for (const d of mine) {
    const askId = d.target && entry.card.asks.some((a) => a.id === d.target) ? d.target : undefined;
    const status = VERB_STATUS[d.verb];
    if (d.verb === "ask") {
      lines.push(`question noted: ${d.question ?? d.raw}`);
      continue;
    }
    if (askId && status) {
      card = { ...card, asks: card.asks.map((a) => (a.id === askId ? { ...a, status } : a)) };
      lines.push(`${askId} ${status}${d.reason ? ` — ${d.reason}` : ""}`);
      continue;
    }
    if (status) {
      card = { ...card, status };
      const option = d.option ? ` (option ${d.option}: ${optionLabel(entry, d.option)})` : "";
      const reason = d.reason ? ` — ${d.reason}` : "";
      const days = d.days ? ` for ${d.days} day(s)` : "";
      lines.push(`${card.nj} ${status}${option}${days}${reason}`);
    }
  }

  // Every ask answered closes the card even when no card-level verb arrived.
  if (card.status === "open" && card.asks.every((a) => a.status !== "open")) {
    card = {
      ...card,
      status: card.asks.some((a) => a.status === "rejected") ? "rejected" : "approved",
    };
    lines.push(`${card.nj} ${card.status} (every ask answered)`);
  }

  const resolution: Resolution = {
    entry: { ...entry, card },
    changed: card !== entry.card,
    acknowledgement: [
      `Read at ${now.toISOString()}:`,
      ...lines.map((l) => `* ${l}`),
      reply.clarification ? `\n${reply.clarification}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  };
  if (card.status === "approved" || card.status === "defaulted") {
    resolution.moveTo = "Ready for Claude";
  } else if (card.status === "rejected") {
    resolution.moveTo = "Backlog";
  }
  return resolution;
}

function optionLabel(entry: QueueEntry, n: number): string {
  return entry.card.options.find((o) => o.n === n)?.label ?? "unknown option";
}

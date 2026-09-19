/**
 * The decision card (PAP-94): the only shape that may enter `Needs Justin`.
 *
 * A card is one decision for one human. It batches up to `maxAsksPerCard`
 * related asks (NJ-2 "Infra batch" is four), each carrying its own default, so
 * Justin answers a subject once instead of four times. The markdown a card
 * renders to lives in `templates/needs-justin-card.md`; the fenced
 * ```paperos-card block at its foot is the machine-readable source of truth
 * that `parseCardBlock()` reads back.
 *
 * Policy: docs/pm/justin-queue.md
 */
import { z } from "zod";

/** Reasons a decision genuinely needs the human (roster escalation matrix). */
export const ADMISSION_CATEGORIES = [
  "release-candidate",
  "irreversible-action",
  "spend",
  "external-communication",
  "credential-grant",
  "new-character",
  "architecture-reversal",
  "legal-tax-posture",
] as const;
export type AdmissionCategory = (typeof ADMISSION_CATEGORIES)[number];

/** Reasons a machine decides instead. A card citing one of these is bounced. */
export const REFUSED_CATEGORIES = [
  "code-review",
  "test-failure",
  "library-choice",
  "already-decided",
  "has-safe-default",
  "estimate-or-schedule",
] as const;
export type RefusedCategory = (typeof REFUSED_CATEGORIES)[number];

export const CARD_STATUSES = [
  "draft",
  "open",
  "queued",
  "approved",
  "rejected",
  "defaulted",
  "deferred",
  "withdrawn",
] as const;
export type CardStatus = (typeof CARD_STATUSES)[number];

/** `Needs Justin` cards are numbered NJ-1.. in the Execution Schedule. */
const NJ_ID = /^NJ-\d+$/;
const ASK_ID = /^NJ-\d+\.\d+$/;
const ISSUE_ID = /^PAP-\d+$/;

export const CardOptionSchema = z.object({
  /** 1-based, as Justin types it: `/approve option 2`. */
  n: z.number().int().min(1).max(3),
  label: z.string().min(1).max(200),
  /** One-off or monthly cost in USD; `0` for free, omitted when unknown. */
  costUsd: z.number().min(0).optional(),
  risk: z.string().min(1).max(200),
});
export type CardOption = z.infer<typeof CardOptionSchema>;

export const AskSchema = z.object({
  /** `NJ-<card>.<n>`, stable for the life of the card. */
  id: z.string().regex(ASK_ID, "ask id must look like NJ-2.3"),
  /** What is being asked, in one line Justin can answer from a phone. */
  ask: z.string().min(1).max(400),
  /** What happens if he never answers this line. Every ask has one. */
  default: z.string().min(1).max(300),
  /**
   * True when no default is safe: the ask waits forever rather than
   * auto-applying. A hard-block ask makes the whole card a hard block.
   */
  hardBlock: z.boolean().default(false),
  status: z.enum(CARD_STATUSES).default("open"),
});
export type Ask = z.infer<typeof AskSchema>;

export const DecisionCardSchema = z
  .object({
    /** Dedupe key: one subject, one card. Two cards with the same key merge. */
    key: z
      .string()
      .min(3)
      .max(64)
      .regex(/^[a-z0-9][a-z0-9-]*$/, "key must be a lower-case slug"),
    /** Execution Schedule number, e.g. `NJ-2`. */
    nj: z.string().regex(NJ_ID, "nj must look like NJ-2"),
    /** The Linear issue the card is filed on. */
    issue: z.string().regex(ISSUE_ID, "issue must look like PAP-25"),
    title: z.string().min(1).max(120),
    category: z.enum(ADMISSION_CATEGORIES),
    /** Linear priority of the filing issue; 1 = urgent, 4 = low. */
    priority: z.number().int().min(0).max(4).default(2),
    /** Urgent cards may bump a non-urgent card out of a full queue. */
    urgent: z.boolean().default(false),
    /** `Decision needed`: the question in one sentence. */
    decisionNeeded: z.string().min(1).max(400),
    /** `Recommendation`: what Atlas would do, one sentence. */
    recommendation: z.string().min(1).max(400),
    /** `Options`: at most three, each with cost and risk. Empty = yes/no card. */
    options: z.array(CardOptionSchema).max(3).default([]),
    /** The batched asks, 1..5. A card with six asks is two cards. */
    asks: z.array(AskSchema).min(1).max(5),
    /** ISO timestamp the card entered `Needs Justin`; the SLA clock starts here. */
    openedAt: z.iso.datetime(),
    /** `Deadline`: hard external date, if any. Distinct from the 48 h default. */
    deadline: z.iso.datetime().optional(),
    /** `Default if no answer`, applied after `defaultTimeoutHours`. */
    defaultIfNoAnswer: z.string().min(1).max(400),
    /** Card-level hard block: nothing auto-applies, the card waits. */
    hardBlock: z.boolean().default(false),
    /** `Context links`: issues, docs, ADRs. */
    contextLinks: z.array(z.string().min(1)).max(10).default([]),
    /** USD at stake; required for `spend` cards, checked against the threshold. */
    spendUsd: z.number().min(0).optional(),
    /** What stops if this is never answered. `none` is the normal case. */
    blocks: z.array(z.string().regex(ISSUE_ID)).max(20).default([]),
    status: z.enum(CARD_STATUSES).default("draft"),
  })
  .refine((c) => c.options.length !== 1, {
    message: "a card offers zero options (yes/no) or two to three, never one",
    path: ["options"],
  })
  .refine((c) => c.options.every((o, i) => o.n === i + 1), {
    message: "options must be numbered 1..n in order",
    path: ["options"],
  })
  .refine((c) => c.asks.every((a) => a.id.startsWith(`${c.nj}.`)), {
    message: "every ask id must be prefixed with the card's NJ number",
    path: ["asks"],
  })
  .refine((c) => new Set(c.asks.map((a) => a.id)).size === c.asks.length, {
    message: "ask ids must be unique within a card",
    path: ["asks"],
  })
  .refine((c) => c.category !== "spend" || typeof c.spendUsd === "number", {
    message: "a spend card must state spendUsd",
    path: ["spendUsd"],
  });

export type DecisionCard = z.infer<typeof DecisionCardSchema>;

/** A card as it sits in the queue, with whatever has happened to it since. */
export const QueueEntrySchema = z.object({
  card: DecisionCardSchema,
  /** When the card was pushed to `queued-for-justin`, if it was. */
  queuedAt: z.iso.datetime().optional(),
  /** The Linear state the issue must return to when the card resolves. */
  previousState: z.string().default("In Progress"),
  /** Last reminder posted, for the nudge cadence. */
  lastNudgeAt: z.iso.datetime().optional(),
});
export type QueueEntry = z.infer<typeof QueueEntrySchema>;

/** Card statuses that occupy a slot in the five. */
export const OPEN_STATUSES: readonly CardStatus[] = ["open"] as const;

export function isCardOpen(card: DecisionCard): boolean {
  return OPEN_STATUSES.includes(card.status);
}

/** A card nobody is waiting on any more: a reply on it is acknowledged, not acted on. */
export function isClosed(card: DecisionCard): boolean {
  return (
    card.status === "approved" ||
    card.status === "rejected" ||
    card.status === "defaulted" ||
    card.status === "withdrawn"
  );
}

/** A card is a hard block when it says so or any of its asks does. */
export function isHardBlock(card: DecisionCard): boolean {
  return card.hardBlock || card.asks.some((a) => a.hardBlock);
}

/** Hours elapsed since the card opened, at `now`. */
export function ageHours(card: DecisionCard, now: Date): number {
  return (now.getTime() - new Date(card.openedAt).getTime()) / 3_600_000;
}

export const CARD_FENCE = "paperos-card" as const;

const FENCE_RE = /```paperos-card\s*\n([\s\S]*?)\n```/;

/**
 * Reads the machine-readable block back out of a rendered card comment.
 * Returns `undefined` for a comment without a block (a hand-written card:
 * `--check` reports it as unstructured rather than throwing).
 */
export function parseCardBlock(commentBody: string): DecisionCard | undefined {
  const m = FENCE_RE.exec(commentBody);
  if (!m?.[1]) return undefined;
  let json: unknown;
  try {
    json = JSON.parse(m[1]);
  } catch {
    return undefined;
  }
  const parsed = DecisionCardSchema.safeParse(json);
  return parsed.success ? parsed.data : undefined;
}

/** Validates an untrusted object as a card, throwing a readable error. */
export function parseCard(input: unknown): DecisionCard {
  return DecisionCardSchema.parse(input);
}

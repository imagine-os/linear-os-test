/**
 * The reply grammar (PAP-94).
 *
 * Justin answers a card by commenting. The grammar is deliberately tiny and
 * forgiving: a slash is optional, case and punctuation are ignored, one typo
 * is repaired, and several cards can be answered in one comment with
 * `PAP-25: approve` pairs. Regex only — when nothing matches we return a
 * clarifying question for the caller to post; we never guess a verb, and an
 * LLM may only phrase the question, never act on it.
 *
 * Only an authorised author is obeyed (T1 in the threat model §6); everyone
 * else's comment is data.
 *
 * Policy: docs/pm/justin-queue.md
 */
import { DEFAULT_JUSTIN_QUEUE_CONFIG, type JustinQueueConfig } from "./config.js";

export const DECISION_VERBS = ["approve", "reject", "option", "defer", "ask"] as const;
export type DecisionVerb = (typeof DECISION_VERBS)[number];

export interface Decision {
  verb: DecisionVerb;
  /** `PAP-25`, `NJ-2` or `NJ-2.3`; absent means "this whole card". */
  target?: string;
  /** 1-based option number for `option`, or for `approve option 2`. */
  option?: number;
  /** Days for `defer 3d`. */
  days?: number;
  /** The question for `ask:`. */
  question?: string;
  /** Free text after `reject`. */
  reason?: string;
  /** Where the decision came from. Only `reply` is Justin typing. */
  source: "reply" | "default" | "state-change";
  /** The line as typed, for the acknowledgement. */
  raw: string;
  /** True when a typo was repaired to reach this verb. */
  corrected?: boolean;
}

export interface ParsedReply {
  /** False when the author is not on `replyAuthors`: nothing is acted on. */
  authorized: boolean;
  decisions: Decision[];
  /** Lines that matched nothing. */
  unparsed: string[];
  /**
   * The single clarifying question to post back, set when the comment was
   * prose that matched nothing, or a `reject` arrived with no reason.
   */
  clarification?: string;
}

const VERB_ALIASES: Record<string, DecisionVerb> = {
  approve: "approve",
  approved: "approve",
  approves: "approve",
  approval: "approve",
  ok: "approve",
  okay: "approve",
  yes: "approve",
  y: "approve",
  yep: "approve",
  yeah: "approve",
  lgtm: "approve",
  go: "approve",
  ship: "approve",
  accept: "approve",
  accepted: "approve",
  agreed: "approve",
  reject: "reject",
  rejected: "reject",
  rejects: "reject",
  no: "reject",
  nope: "reject",
  deny: "reject",
  denied: "reject",
  decline: "reject",
  declined: "reject",
  stop: "reject",
  option: "option",
  opt: "option",
  choose: "option",
  pick: "option",
  defer: "defer",
  deferred: "defer",
  delay: "defer",
  postpone: "defer",
  snooze: "defer",
  later: "defer",
  ask: "ask",
  question: "ask",
  clarify: "ask",
  q: "ask",
};

const ALIAS_KEYS = Object.keys(VERB_ALIASES);

/** `PAP-25: approve`, `NJ-2.3 - reject too dear`, `/NJ-2: option 2`. */
const TARGETED = /^\/?\s*((?:PAP-\d+)|(?:NJ-\d+(?:\.\d+)?))\s*[:\-—]\s*(.+)$/i;
/** `3d`, `3 days`, `3day`. */
const DAYS = /^(\d{1,3})\s*(?:d|days?)?$/i;

function normalizeToken(token: string): string {
  return token
    .toLowerCase()
    .replace(/^[^\p{L}\p{N}]+/u, "")
    .replace(/[^\p{L}\p{N}]+$/u, "");
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min((row[j - 1] ?? 0) + 1, (prev[j] ?? 0) + 1, (prev[j - 1] ?? 0) + cost);
    }
    prev = row;
  }
  return prev[b.length] ?? 0;
}

/** Exact alias, else the nearest alias within a one- or two-character typo. */
function matchVerb(token: string): { verb: DecisionVerb; corrected: boolean } | undefined {
  const t = normalizeToken(token);
  if (!t) return undefined;
  const exact = VERB_ALIASES[t];
  if (exact) return { verb: exact, corrected: false };
  if (t.length < 3) return undefined;
  const budget = t.length >= 6 ? 2 : 1;
  let best: { alias: string; distance: number } | undefined;
  for (const alias of ALIAS_KEYS) {
    if (alias.length < 3) continue;
    if (Math.abs(alias.length - t.length) > budget) continue;
    const d = levenshtein(t, alias);
    if (d <= budget && (!best || d < best.distance)) best = { alias, distance: d };
  }
  const verb = best ? VERB_ALIASES[best.alias] : undefined;
  return verb ? { verb, corrected: true } : undefined;
}

function parsePhrase(
  phrase: string,
  target: string | undefined,
  raw: string,
): Decision | undefined {
  const text = phrase.trim().replace(/^\/+/, "").trim();
  if (!text) return undefined;

  // `ask: why?` — the colon form keeps the question intact.
  const askColon = /^(ask|q|question|clarify)\s*[:,]\s*(.+)$/i.exec(text);
  if (askColon?.[2]) {
    return { verb: "ask", target, question: askColon[2].trim(), source: "reply", raw };
  }

  const tokens = text.split(/\s+/);
  const head = tokens[0] ?? "";
  const rest = tokens.slice(1).join(" ").trim();

  // A bare `2` answers an options card.
  if (!VERB_ALIASES[normalizeToken(head)] && /^[1-3][.)]?$/.test(head) && tokens.length === 1) {
    return { verb: "option", target, option: Number(head[0]), source: "reply", raw };
  }

  const matched = matchVerb(head);
  if (!matched) {
    // Prose ending in a question mark is a question, not a decision.
    if (text.endsWith("?")) {
      return { verb: "ask", target, question: text, source: "reply", raw };
    }
    return undefined;
  }
  const { verb, corrected } = matched;
  const decision: Decision = { verb, source: "reply", raw };
  if (target) decision.target = target;
  if (corrected) decision.corrected = true;

  if (verb === "approve") {
    // `approve option 2` / `approve 2` / `approve, option 2`
    const opt = /(?:^|\b)(?:option|opt)?\s*([1-3])\b/.exec(rest);
    if (rest && opt?.[1]) decision.option = Number(opt[1]);
    else if (rest) decision.reason = rest;
    return decision;
  }
  if (verb === "option") {
    const n = /([1-3])/.exec(rest);
    if (!n?.[1]) return undefined;
    decision.option = Number(n[1]);
    return decision;
  }
  if (verb === "reject") {
    if (rest) decision.reason = rest.replace(/^[:,\-—\s]+/, "").trim();
    return decision;
  }
  if (verb === "defer") {
    const m = DAYS.exec(rest.replace(/\s*for\s*/i, "").trim());
    decision.days = m?.[1] ? Number(m[1]) : 1;
    return decision;
  }
  decision.question = rest || text;
  return decision;
}

export interface ParseReplyOptions {
  /** Linear name, displayName or email of the comment author. */
  author?: string;
  config?: JustinQueueConfig;
  /** Skip the author check (used by the digest's self-tests and fixtures). */
  trustAuthor?: boolean;
}

/** True when this author's comments carry instructions rather than data. */
export function isAuthorizedReplier(
  author: string | undefined,
  config: JustinQueueConfig = DEFAULT_JUSTIN_QUEUE_CONFIG,
): boolean {
  if (!author) return false;
  const a = author.trim().toLowerCase();
  return config.replyAuthors.some((allowed) => {
    const v = allowed.trim().toLowerCase();
    return a === v || a.startsWith(`${v}@`) || a.split("@")[0] === v;
  });
}

/**
 * Parses one Linear comment into zero or more decisions.
 *
 * Quoted lines, fenced blocks and the rendered card itself are ignored, so a
 * reply that quotes the card still parses to exactly what Justin typed.
 */
export function parseReply(text: string, options: ParseReplyOptions = {}): ParsedReply {
  const config = options.config ?? DEFAULT_JUSTIN_QUEUE_CONFIG;
  const authorized = options.trustAuthor === true || isAuthorizedReplier(options.author, config);
  if (!authorized) {
    return { authorized: false, decisions: [], unparsed: [] };
  }

  const decisions: Decision[] = [];
  const unparsed: string[] = [];
  let inFence = false;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line.startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence || !line || line.startsWith(">") || line.startsWith("#")) continue;

    const targeted = TARGETED.exec(line);
    const decision = targeted?.[1]
      ? parsePhrase(targeted[2] ?? "", targeted[1].toUpperCase(), line)
      : parsePhrase(line, undefined, line);
    if (decision) decisions.push(decision);
    else unparsed.push(line);
  }

  const reply: ParsedReply = { authorized: true, decisions, unparsed };
  if (decisions.length === 0 && unparsed.length > 0) {
    reply.clarification =
      "I could not read a decision in that. Reply with `/approve`, " +
      "`/reject <reason>`, `/option <n>` or `/defer <n>d` on the first line.";
  } else {
    const reasonless = decisions.find((d) => d.verb === "reject" && !d.reason);
    if (reasonless) {
      reply.clarification =
        "Recorded the rejection. What is the reason? (`/reject <reason>` keeps it on the card.)";
    }
  }
  return reply;
}

/**
 * Edge case from the spec: Justin moves the issue out of `Needs Justin`
 * himself instead of commenting. Leaving the state is approval of the
 * recommendation; moving it to Backlog is a rejection.
 */
export function decisionFromStateChange(toState: string): Decision | undefined {
  const s = toState.trim().toLowerCase();
  if (s === "backlog" || s === "canceled" || s === "cancelled") {
    return {
      verb: "reject",
      source: "state-change",
      raw: `state → ${toState}`,
      reason: "moved out of Needs Justin by hand",
    };
  }
  if (s === "needs justin" || s === "triage" || s === "todo") return undefined;
  return { verb: "approve", source: "state-change", raw: `state → ${toState}` };
}

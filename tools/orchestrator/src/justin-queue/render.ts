/**
 * Rendering a card to the comment Justin reads (PAP-94).
 *
 * The markdown comes from `templates/needs-justin-card.md` (same `{{name}}`
 * placeholder convention as the PAP-92 session templates); the fenced
 * ```paperos-card block at its foot carries the card verbatim so
 * `parseCardBlock()` can read it back without re-parsing prose.
 *
 * Policy: docs/pm/justin-queue.md
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CARD_FENCE, type DecisionCard } from "./card.js";
import { DEFAULT_JUSTIN_QUEUE_CONFIG, type JustinQueueConfig } from "./config.js";
import { defaultAppliesAt } from "./defaults.js";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..", "..");

export const CARD_TEMPLATE = "needs-justin-card";

function money(usd: number | undefined): string {
  if (usd === undefined) return "cost unknown";
  return usd === 0 ? "free" : `$${usd.toLocaleString("en-US")}`;
}

/** Fills the template. Throws when a placeholder has no value, like PAP-92's renderer. */
export function renderCard(
  card: DecisionCard,
  config: JustinQueueConfig = DEFAULT_JUSTIN_QUEUE_CONFIG,
  templateDir = resolve(repoRoot, "templates"),
): string {
  const src = readFileSync(resolve(templateDir, `${CARD_TEMPLATE}.md`), "utf8");
  const vars: Record<string, string> = {
    nj: card.nj,
    title: card.title,
    category: card.category,
    urgentFlag: card.urgent ? ", urgent" : "",
    issue: card.issue,
    decisionNeeded: card.decisionNeeded,
    recommendation: card.recommendation,
    optionsBlock:
      card.options.length === 0
        ? "**Options.** Yes or no."
        : [
            "**Options.**",
            ...card.options.map((o) => `${o.n}. ${o.label} — ${money(o.costUsd)}; ${o.risk}`),
          ].join("\n"),
    askCount: String(card.asks.length),
    asksBlock: card.asks
      .map(
        (a) =>
          `* \`${a.id}\` ${a.ask} — default: ${a.default}${a.hardBlock ? " **(hard block: no default applies)**" : ""}`,
      )
      .join("\n"),
    deadline: card.deadline
      ? `${card.deadline} (hard)`
      : `${defaultAppliesAt(card, config).toISOString()} (${config.defaultTimeoutHours} h after opening)`,
    defaultIfNoAnswer: card.hardBlock
      ? `${card.defaultIfNoAnswer} — **hard block: this never applies by itself, the card waits.**`
      : card.defaultIfNoAnswer,
    blocks: card.blocks.length === 0 ? "nothing (the loop keeps building)" : card.blocks.join(", "),
    contextBlock: card.contextLinks.length === 0 ? "—" : card.contextLinks.join(" · "),
    firstAskId: card.asks[0]?.id ?? `${card.nj}.1`,
    cardJson: JSON.stringify(card, null, 2),
  };
  const out = src.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = vars[key];
    if (value === undefined) throw new Error(`${CARD_TEMPLATE}: missing placeholder ${key}`);
    return value;
  });
  if (!out.includes(`\`\`\`${CARD_FENCE}`)) {
    throw new Error(`${CARD_TEMPLATE}: template lost its ${CARD_FENCE} block`);
  }
  return out.trimEnd();
}

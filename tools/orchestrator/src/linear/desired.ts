/**
 * The desired Linear workspace configuration for team PAP (PAP-91).
 *
 * Everything the live workspace already has right (states, Phase/Type/Model/
 * Reasoning-effort/Surface/Chunk groups, `Todo` as human parking, the
 * ungrouped surfaces, `issueEstimationType: fibonacci`, cycles, triage) is
 * treated as correct per the spec and is NOT listed here — this module only
 * names the additions PAP-91 is responsible for, plus the template body it
 * corrects.
 */

import { randomUUID } from "node:crypto";
import type { DesiredConfig, DesiredLabel } from "./types.js";
import { CHARACTERS } from "./workspace.js";

/** Nine `Character/<Name>` labels, one per PaperOS agent character, so PAP-99
 * can route issues by who is building them. */
const characterLabels: DesiredLabel[] = [
  { name: "Character", parent: null },
  ...CHARACTERS.map((name) => ({ name, parent: "Character" })),
];

/** Round-4 amendment labels managed by this same script. `sla:*` is a
 * wildcard family with no concrete member named in the spec, so it is
 * intentionally skipped (create the concrete `sla:<n>h` labels only once a
 * spec names one). */
const round4Labels: DesiredLabel[] = [
  { name: "gates-pending", parent: null },
  { name: "stuck", parent: null },
  { name: "slack-risk", parent: null },
  { name: "critical-path", parent: null },
  { name: "source:slack", parent: null },
  { name: "triaged", parent: null },
];

/** The eleven-section PaperOS issue contract (CLAUDE.md / PAP-93), in the
 * order every hand-written spec under `specs/` already uses. The live
 * "PaperOS Spec" template still carries the pre-round-1 section names
 * (Design / Approach, Page spec, Acceptance criteria, Verification, ...) —
 * this is the template drift the DoD calls out. */
export const ISSUE_CONTRACT_SECTIONS = [
  "Goal",
  "Scope",
  "Spec",
  "Interface contract",
  "Test plan",
  "Definition of done",
  "Edge cases",
  "Dependencies",
  "Agent",
  "Size",
  "Demo",
] as const;

function specTemplateMarkdown(): string {
  const lines: string[] = ["**Model / Effort:** "];
  for (const section of ISSUE_CONTRACT_SECTIONS) {
    lines.push("", `## ${section}`, "");
  }
  return `${lines.join("\n").trimEnd()}\n`;
}

/** ProseMirror doc for the same body, matching the shape Linear's existing
 * templates use (`descriptionData`) — headings only, exactly the pattern
 * the team's own templates already use (verified against the live
 * "PaperOS Spec" and "Sub-feature child" templates before this change). A
 * leading paragraph with a `bold` mark was tried and made Linear reject
 * the whole document as unparseable, wrapping it in an opaque
 * `unsupported_block_node` instead of storing real headings — so the
 * "Model / Effort:" line lives only in the markdown `description`, not
 * here. Every heading carries a unique `id` attr, matching the live
 * templates. */
export function specTemplateDoc(): unknown {
  const content: unknown[] = ISSUE_CONTRACT_SECTIONS.map((section) => ({
    type: "heading",
    attrs: { level: 2, id: randomUUID() },
    content: [{ type: "text", text: section }],
  }));
  return { type: "doc", content };
}

export function desiredConfig(): DesiredConfig {
  return {
    team: { key: "PAP" },
    labels: [...characterLabels, ...round4Labels],
    templates: [
      {
        name: "PaperOS Spec",
        sections: [...ISSUE_CONTRACT_SECTIONS],
        body: specTemplateMarkdown(),
      },
    ],
    // Pinned by id (not by "the state currently named X"), so a rename is
    // detected as drift instead of silently accepted. Ids from the live
    // team-PAP snapshot (2026-09-19).
    stateNames: [
      { id: "185d9592-5ff4-4e22-a276-1855a30f69e0", name: "Triage" },
      { id: "0aed245d-f842-423f-bb5c-246061bf9b1b", name: "Backlog" },
      { id: "f3cf0bbf-e4a5-4593-9148-f8ec6ea2d575", name: "Todo" },
      { id: "9f24c1d6-b544-4d67-be55-6a1da5323ee2", name: "Ready for Claude" },
      { id: "0efe97be-429e-42b9-8c63-213a89f06914", name: "In Progress" },
      { id: "38a800c6-7918-4032-9e06-61cbd8adefd0", name: "In Review" },
      { id: "b8037cb1-0718-412f-b913-82b5e4f19555", name: "Needs Justin" },
      { id: "cd5b3745-c3c2-440f-a04c-15de771467ba", name: "Done" },
      { id: "51c3888d-92a0-44bf-a94f-74ec4c3a0766", name: "Canceled" },
      { id: "b9c3b711-0ffb-4dd3-acf5-4082e18dca87", name: "Duplicate" },
    ],
    teamSettings: {
      issueEstimationType: "fibonacci",
      cyclesEnabled: true,
      triageEnabled: true,
    },
  };
}

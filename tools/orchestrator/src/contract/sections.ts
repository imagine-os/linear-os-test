/**
 * Markdown section parsing for the issue contract (PAP-93).
 *
 * A heading is a line that is only `**Name**` (Linear's bold-line style, which
 * every live PAP issue uses) or an ATX heading `# Name` .. `### Name`. A plain
 * `Goal:` line is not a heading (Edge cases: foreign style -> MISSING_SECTION).
 */

import { SECTIONS, type Section } from "./types.js";

const HEADING_RE = /^\s*(?:\*\*\s*(.+?)\s*\*\*\s*:?\s*|#{1,3}\s+(.+?)\s*#*\s*)$/;

/** Canonical name for a heading text, or undefined when it is not a contract section. */
export function canonicalSection(heading: string): Section | undefined {
  const key = normalize(heading);
  for (const s of SECTIONS) {
    if (normalize(s) === key) return s;
  }
  // Accept the common variants the plan documents used before round 1.
  if (key === "definitionofdone" || key === "dod") return "Definition of done";
  if (key === "interfacecontract" || key === "interface") return "Interface contract";
  if (key === "testplan" || key === "tests") return "Test plan";
  if (key === "edgecases") return "Edge cases";
  return undefined;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[`*_:]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

export interface Heading {
  /** Text exactly as written (markers stripped). */
  raw: string;
  /** Canonical section, when the heading is one. */
  section?: Section;
  /** 0-based line index. */
  line: number;
}

/** Every heading in document order, contract sections tagged. */
export function parseHeadings(markdown: string): Heading[] {
  const out: Heading[] = [];
  const lines = markdown.split(/\r?\n/);
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = HEADING_RE.exec(line);
    if (!m) continue;
    const raw = (m[1] ?? m[2] ?? "").trim();
    if (!raw) continue;
    const section = canonicalSection(raw);
    out.push(section ? { raw, section, line: i } : { raw, line: i });
  }
  return out;
}

/**
 * `parseSections(markdown): Record<Section, string>` — the body text of every
 * contract section found (trimmed). Missing sections are absent from the
 * record (so `"Goal" in parsed` answers MISSING_SECTION and `parsed.Goal === ""`
 * answers EMPTY_SECTION). The first occurrence of a section wins; a heading
 * that is not a contract section ends the previous section like any other.
 */
export function parseSections(markdown: string): Partial<Record<Section, string>> {
  const lines = markdown.split(/\r?\n/);
  const headings = parseHeadings(markdown);
  const out: Partial<Record<Section, string>> = {};
  for (let h = 0; h < headings.length; h++) {
    const cur = headings[h];
    if (!cur?.section || cur.section in out) continue;
    const next = headings[h + 1];
    const end = next ? next.line : lines.length;
    out[cur.section] = lines
      .slice(cur.line + 1, end)
      .join("\n")
      .trim();
  }
  return out;
}

/** Contract sections in the order they appear (first occurrence). */
export function sectionOrder(markdown: string): Section[] {
  const seen = new Set<Section>();
  const order: Section[] = [];
  for (const h of parseHeadings(markdown)) {
    if (h.section && !seen.has(h.section)) {
      seen.add(h.section);
      order.push(h.section);
    }
  }
  return order;
}

/**
 * `parseFilesGlobs(scope): string[]` — the globs of every `Files:` line in the
 * Scope section, for PAP-99. Accepts `Files: a/**, b/*.ts`, a bullet
 * `* Files: ...`, and one glob per following bullet/line until a blank line.
 * Backticks are stripped; duplicates removed, order kept.
 */
export function parseFilesGlobs(scope: string): string[] {
  const globs: string[] = [];
  const lines = scope.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const m = /^\s*(?:[-*+]\s+)?`?Files`?\s*:\s*(.*)$/i.exec(lines[i] ?? "");
    if (!m) continue;
    const inline = m[1] ?? "";
    pushGlobs(globs, inline);
    if (inline.trim() === "") {
      // Block form: following indented bullets/lines until a blank line.
      for (let j = i + 1; j < lines.length; j++) {
        const l = lines[j] ?? "";
        if (l.trim() === "") break;
        if (HEADING_RE.test(l)) break;
        pushGlobs(globs, l.replace(/^\s*[-*+]\s+/, ""));
      }
    }
  }
  return [...new Set(globs)];
}

function pushGlobs(into: string[], text: string): void {
  for (const part of text.split(/[,\s]+/)) {
    const g = part.replace(/`/g, "").trim();
    if (g && /[\w./*[\]{}!@-]/.test(g)) into.push(g);
  }
}

/** Normalise a Size section to `S | M | L`, or undefined when it is none of them. */
export function normalizeSize(sizeText: string): "S" | "M" | "L" | undefined {
  const first = sizeText.trim().split(/\r?\n/)[0]?.replace(/[`*_]/g, "").trim();
  if (!first) return undefined;
  const m = /^(S|M|L|small|medium|large)(?=$|[\s:.,;(])/i.exec(first);
  if (!m) return undefined;
  const letter = (m[1] ?? "").charAt(0).toUpperCase();
  return letter === "S" || letter === "M" || letter === "L" ? letter : undefined;
}

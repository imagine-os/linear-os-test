import { describe, expect, it } from "vitest";
import {
  canonicalSection,
  normalizeSize,
  parseFilesGlobs,
  parseHeadings,
  parseSections,
  sectionOrder,
} from "../../src/contract/sections.js";

describe("parseSections", () => {
  it("reads bold-line and ATX headings alike (heading normalisation)", () => {
    const bold = "**Goal**\n\nA\n\n**Scope**\n\nB\n";
    const hash = "## Goal\n\nA\n\n### Scope\n\nB\n";
    expect(parseSections(bold)).toEqual({ Goal: "A", Scope: "B" });
    expect(parseSections(hash)).toEqual(parseSections(bold));
  });

  it("does not treat a plain `Goal:` line as a heading", () => {
    expect(parseSections("Goal:\n\nA\n\nScope:\n\nB")).toEqual({});
  });

  it("accepts `**Goal:**` and case variants, keeps the first occurrence, ignores fenced code", () => {
    const md =
      "**goal:**\n\nA\n\n```\n**Scope**\nnot a heading\n```\n\n**Definition of Done**\n\nD\n\n**Goal**\n\nsecond";
    const s = parseSections(md);
    expect(s.Goal?.startsWith("A\n")).toBe(true);
    expect(s.Goal).toContain("not a heading");
    expect(s["Definition of done"]).toBe("D");
    expect(s.Scope).toBeUndefined();
  });

  it("ends a section at a non-contract heading", () => {
    const s = parseSections("**Goal**\n\nA\n\n**Source**\n\nslack\n\n**Size**\n\nM");
    expect(s.Goal).toBe("A");
    expect(s.Size).toBe("M");
  });

  it("reports an empty section as an empty string, a missing one as absent", () => {
    const s = parseSections("**Goal**\n\n**Scope**\n\nB");
    expect(s.Goal).toBe("");
    expect("Spec" in s).toBe(false);
  });
});

describe("parseHeadings / sectionOrder / canonicalSection", () => {
  it("tags contract sections and keeps foreign headings", () => {
    const h = parseHeadings("**Goal**\n\n**Module boundary**\n\n## Size");
    expect(h.map((x) => [x.raw, x.section])).toEqual([
      ["Goal", "Goal"],
      ["Module boundary", undefined],
      ["Size", "Size"],
    ]);
    expect(sectionOrder("**Size**\n\n**Goal**\n\n**Size**")).toEqual(["Size", "Goal"]);
  });

  it("normalises common variants", () => {
    expect(canonicalSection("DoD")).toBe("Definition of done");
    expect(canonicalSection("Interface")).toBe("Interface contract");
    expect(canonicalSection("Tests")).toBe("Test plan");
    expect(canonicalSection("edge-cases")).toBe("Edge cases");
    expect(canonicalSection("Source")).toBeUndefined();
  });
});

describe("parseFilesGlobs", () => {
  it("reads inline, bullet and block forms, strips backticks, dedupes", () => {
    const scope = [
      "* In: the validator.",
      "* Files: `src/contract/**`, tests/contract/*.test.ts",
      "Files:",
      "  - docs/pm/issue-contract.md",
      "  - `src/contract/**`",
      "",
      "* Out: nothing else.",
    ].join("\n");
    expect(parseFilesGlobs(scope)).toEqual([
      "src/contract/**",
      "tests/contract/*.test.ts",
      "docs/pm/issue-contract.md",
    ]);
  });

  it("returns [] when Scope has no Files line and stops a block at a heading", () => {
    expect(parseFilesGlobs("* In: x")).toEqual([]);
    expect(parseFilesGlobs("Files:\n**Spec**\nnot/a/glob")).toEqual([]);
  });
});

describe("normalizeSize", () => {
  it("normalises S/M/L and the long words, with trailing prose", () => {
    expect(normalizeSize("M")).toBe("M");
    expect(normalizeSize("M: one session.")).toBe("M");
    expect(normalizeSize("Small")).toBe("S");
    expect(normalizeSize("large, split into three children")).toBe("L");
    expect(normalizeSize("`S`")).toBe("S");
    expect(normalizeSize("L (umbrella; children are M, M, S)")).toBe("L");
  });

  it("rejects anything else", () => {
    expect(normalizeSize("XL")).toBeUndefined();
    expect(normalizeSize("Medium-ish")).toBeUndefined();
    expect(normalizeSize("")).toBeUndefined();
    expect(normalizeSize("To be specified when promoted")).toBeUndefined();
    expect(normalizeSize("Sprint")).toBeUndefined();
  });
});

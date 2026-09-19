import { describe, expect, it } from "vitest";
import { makeValidator } from "../../scripts/playbook-dryrun.js";
import { parseFooter } from "../../src/agents/session-footer.js";
import {
  type AuditRow,
  fillTemplate,
  isPromotable,
  renderAuditTable,
  renderViolationsComment,
  toAuditRow,
} from "../../src/contract/render.js";
import { validateIssue } from "../../src/contract/validate.js";
import { goodIssue, loadFixtures } from "./helpers.js";

const validateFooter = makeValidator();

describe("renderViolationsComment", () => {
  const bad = loadFixtures("bad").find((f) => f.name === "everything-wrong");
  if (!bad) throw new Error("fixture missing");
  const result = validateIssue(bad.issue);

  it("renders the template with a table row per violation, errors first, and a valid contract-failed footer", () => {
    const body = renderViolationsComment(bad.issue, result, {
      outcome: "bounced",
      movedTo: "Backlog",
      branch: "feat/PAP-9220-x",
      now: new Date("2026-09-19T03:00:00Z"),
    });
    expect(body).toContain(
      "**Issue contract: 8 error(s), 1 warning(s)** — PAP-9220 moved back to `Backlog`",
    );
    expect(body).toContain("| `READY_BUT_BLOCKED` | error |");
    const rows = body.split("\n").filter((l) => l.startsWith("| `"));
    expect(rows).toHaveLength(result.violations.length);
    const firstWarn = rows.findIndex((l) => l.includes("| warn |"));
    expect(rows.slice(firstWarn).every((l) => l.includes("| warn |"))).toBe(true);
    const footer = parseFooter(body);
    expect(validateFooter(footer), JSON.stringify(validateFooter.errors)).toBe(true);
    expect(footer).toMatchObject({
      status: "contract-failed",
      issue: "PAP-9220",
      character: "orchestrator",
      sessionId: "2026-09-19-PAP-9220",
      branch: "feat/PAP-9220-x",
    });
    expect((footer as { reason: string }).reason).toContain("MISSING_SECTION");
  });

  it("uses a placeholder branch when none is usable and words the Justin / warnings-only cases", () => {
    const justin = renderViolationsComment(bad.issue, result, {
      outcome: "commented",
      branch: "bad branch!",
    });
    expect(justin).toContain("last actor is Justin");
    expect(parseFooter(justin)).toMatchObject({ branch: "feat/PAP-9220" });
    const warnIssue = goodIssue({
      labels: goodIssue().labels.filter((l) => l.group !== "Character"),
    });
    const warnOnly = renderViolationsComment(warnIssue, validateIssue(warnIssue), {
      outcome: "commented",
    });
    expect(warnOnly).toContain("warnings only");
    const f = parseFooter(warnOnly) as { reason: string };
    expect(f.reason).toBe("warnings:LABEL_CHARACTER");
    expect(validateFooter(f)).toBe(true);
  });

  it("fillTemplate throws on an unknown placeholder and escapes pipes in cells", () => {
    expect(() => fillTemplate("{{nope}}", {})).toThrow(/placeholder/);
    const issue = goodIssue({ description: "**Goal**\n\na | b" });
    const body = renderViolationsComment(issue, validateIssue(issue), { outcome: "audit" });
    expect(body).not.toMatch(/\|\s*\n\s*\|\s*\|/);
  });
});

describe("renderAuditTable", () => {
  const rows: AuditRow[] = [
    {
      identifier: "PAP-10",
      title: "b",
      state: "Backlog",
      errors: ["BLOCKED_BY_OPEN"],
      warns: ["LABEL_CHARACTER"],
      umbrella: false,
      deferred: false,
    },
    {
      identifier: "PAP-2",
      title: "a",
      state: "Backlog",
      errors: [],
      warns: [],
      umbrella: false,
      deferred: false,
    },
    {
      identifier: "PAP-3",
      title: "c",
      state: "Backlog",
      errors: [],
      warns: ["NO_SPEC_LINK"],
      umbrella: true,
      deferred: false,
    },
    {
      identifier: "PAP-4",
      title: "d",
      state: "Backlog",
      errors: [],
      warns: [],
      umbrella: false,
      deferred: true,
    },
    {
      identifier: "PAP-5",
      title: "e",
      state: "Ready for Claude",
      errors: ["MISSING_SECTION", "READY_BUT_BLOCKED"],
      warns: [],
      umbrella: false,
      deferred: false,
    },
  ];

  it("summarises per state and code, lists the promotable Backlog set, sorts by number and notes umbrellas/Deferred", () => {
    const md = renderAuditTable(rows, { title: "T" });
    expect(md).toContain("### T");
    expect(md).toContain("5 issue(s); 1 with contract (shape) errors; 1 blocked/unclaimable only");
    expect(md).toContain(
      "Pre-promotion list: 1 of 4 Backlog issue(s) promotable now (zero errors, leaf, not Deferred): PAP-2.",
    );
    expect(md).toContain("| Backlog | 4 | 1 | 1 | 2 |");
    expect(md).toContain("| `BLOCKED_BY_OPEN` | 1 | 0 |");
    const lines = md.split("\n");
    const i2 = lines.findIndex((l) => l.startsWith("| PAP-2 "));
    const i10 = lines.findIndex((l) => l.startsWith("| PAP-10 "));
    expect(i2).toBeLessThan(i10);
    expect(lines.find((l) => l.startsWith("| PAP-3 "))).toContain("| umbrella |");
    expect(lines.find((l) => l.startsWith("| PAP-4 "))).toContain("| Deferred |");
  });

  it("--only-errors and maxRows limit the per-issue rows but not the summary", () => {
    const md = renderAuditTable(rows, { onlyErrors: true, maxRows: 1 });
    expect(md).toContain("1 more row(s) not shown");
    expect(md.split("\n").filter((l) => /^\| PAP-/.test(l))).toHaveLength(1);
    expect(renderAuditTable([], {})).toContain("0 issue(s)");
  });

  it("toAuditRow / isPromotable", () => {
    const issue = goodIssue();
    const row = toAuditRow(issue, validateIssue(issue));
    expect(row).toMatchObject({
      identifier: issue.identifier,
      errors: [],
      umbrella: false,
      deferred: false,
    });
    expect(isPromotable(row)).toBe(true);
    expect(isPromotable({ ...row, deferred: true })).toBe(false);
  });
});

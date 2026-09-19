import { describe, expect, it } from "vitest";
import { resolveConfig } from "../../src/contract/config.js";
import { REQUIRED_SECTIONS, VIOLATION_CODES } from "../../src/contract/types.js";
import {
  errorCodes,
  hasSpecLink,
  scopeNamesRoute,
  validateIssue,
  warnCodes,
} from "../../src/contract/validate.js";
import { fixtureConfig, goodIssue, loadFixtures } from "./helpers.js";

const good = loadFixtures("good");
const bad = loadFixtures("bad");

describe("fixture suite", () => {
  it("has 12 good and 20 bad fixtures", () => {
    expect(good).toHaveLength(12);
    expect(bad).toHaveLength(20);
  });

  for (const f of good) {
    it(`good/${f.name} passes`, () => {
      const r = validateIssue(f.issue, fixtureConfig(f));
      expect(r.ok).toBe(true);
      expect(errorCodes(r)).toEqual([]);
      if (f.expect.warns) expect(warnCodes(r).sort()).toEqual(f.expect.warns);
    });
  }

  for (const f of bad) {
    it(`bad/${f.name} fails with ${f.expect.errors.join(", ")}`, () => {
      const r = validateIssue(f.issue, fixtureConfig(f));
      expect(r.ok).toBe(false);
      expect(errorCodes(r).sort()).toEqual(f.expect.errors);
      if (f.expect.warns) expect(warnCodes(r).sort()).toEqual(f.expect.warns);
      for (const v of r.violations) {
        expect(v.message.length).toBeGreaterThan(0);
        expect(v.fix.length).toBeGreaterThan(0);
      }
    });
  }

  it("every violation code has at least one failing fixture or unit case", () => {
    const seen = new Set<string>();
    for (const f of [...good, ...bad]) {
      for (const v of validateIssue(f.issue, fixtureConfig(f)).violations) seen.add(v.code);
    }
    // SECTION_ORDER is covered by a unit test below.
    const expected = VIOLATION_CODES.filter((c) => c !== "SECTION_ORDER");
    for (const c of expected) expect(seen, c).toContain(c);
  });
});

describe("BLOCKED_BY_OPEN (six cases) and READY_BUT_BLOCKED", () => {
  const withBlocker = (state: string, extra: object = {}, issueState = "Backlog") =>
    goodIssue({
      state: { name: issueState },
      blockedBy: [{ identifier: "PAP-1", state: { name: state }, ...extra }],
    });

  it("fails for Todo, Needs Justin, In Progress and In Review without PR (pr-flow)", () => {
    for (const s of ["Todo", "Needs Justin", "In Progress", "In Review"]) {
      expect(errorCodes(validateIssue(withBlocker(s), { mode: "pr-flow" }))).toEqual([
        "BLOCKED_BY_OPEN",
      ]);
    }
  });

  it("passes for In Review with an open PR, all Done/Canceled, and no blockers", () => {
    expect(
      validateIssue(withBlocker("In Review", { pr: { open: true } }), { mode: "pr-flow" }).ok,
    ).toBe(true);
    expect(
      validateIssue(
        goodIssue({
          blockedBy: [
            { identifier: "a", state: { name: "Done" } },
            { identifier: "b", state: { name: "Canceled" } },
          ],
        }),
      ).ok,
    ).toBe(true);
    expect(validateIssue(goodIssue({ blockedBy: [] })).ok).toBe(true);
  });

  it("build-loop mode treats an In Review blocker as closed", () => {
    expect(validateIssue(withBlocker("In Review")).ok).toBe(true);
  });

  it("READY_BUT_BLOCKED replaces BLOCKED_BY_OPEN in Ready for Claude and clears once the blocker is Done or removed", () => {
    const ready = withBlocker("Backlog", {}, "Ready for Claude");
    expect(errorCodes(validateIssue(ready))).toEqual(["READY_BUT_BLOCKED"]);
    expect(
      validateIssue({ ...ready, blockedBy: [{ identifier: "PAP-1", state: { name: "Done" } }] }).ok,
    ).toBe(true);
    expect(validateIssue({ ...ready, blockedBy: [] }).ok).toBe(true);
    const pr = withBlocker("In Review", { pr: { open: true } }, "Ready for Claude");
    expect(validateIssue(pr, { mode: "pr-flow" }).ok).toBe(true);
  });

  it("fix text names each open blocker and both remedies", () => {
    const v = validateIssue(withBlocker("Needs Justin")).violations.find(
      (x) => x.code === "BLOCKED_BY_OPEN",
    );
    expect(v?.message).toContain("PAP-1 (Needs Justin)");
    expect(v?.fix).toMatch(/wait until/);
    expect(v?.fix).toMatch(/soften the dependency/);
    const prFlow = validateIssue(withBlocker("Todo"), { mode: "pr-flow" }).violations[0];
    expect(prFlow?.fix).toContain("open PR");
  });
});

describe("UMBRELLA_NOT_CLAIMABLE", () => {
  const children = [
    { identifier: "PAP-2", state: { name: "Backlog" } },
    { identifier: "PAP-3", state: { name: "Backlog" }, blockedBySiblings: ["PAP-2"] },
  ];
  it("fires in Ready for Claude and In Progress, and for a claim target; never for a leaf", () => {
    for (const s of ["Ready for Claude", "In Progress"]) {
      const r = validateIssue(goodIssue({ state: { name: s }, children }));
      expect(errorCodes(r)).toEqual(["UMBRELLA_NOT_CLAIMABLE"]);
      expect(r.violations[0]?.fix).toContain("Claim PAP-2 instead");
    }
    expect(errorCodes(validateIssue(goodIssue({ children, claimTarget: true })))).toEqual([
      "UMBRELLA_NOT_CLAIMABLE",
    ]);
    expect(validateIssue(goodIssue({ state: { name: "Ready for Claude" }, children: [] })).ok).toBe(
      true,
    );
    expect(validateIssue(goodIssue({ children })).ok).toBe(true);
  });

  it("names the first open child when the unblocked ones are already Done", () => {
    const r = validateIssue(
      goodIssue({
        state: { name: "In Progress" },
        children: [
          { identifier: "PAP-2", state: { name: "Done" } },
          { identifier: "PAP-3", state: { name: "Backlog" } },
        ],
      }),
    );
    expect(r.violations[0]?.fix).toContain("Claim PAP-3 instead");
  });
});

describe("sections, size, labels, project", () => {
  it("MISSING_SECTION for each required section and warns for recommended ones; foreign heading fix points to the template", () => {
    const r = validateIssue(goodIssue({ description: "Goal: plain\n\nScope: plain" }));
    const missing = r.violations.filter(
      (v) => v.code === "MISSING_SECTION" && v.severity === "error",
    );
    expect(missing.map((v) => v.message)).toHaveLength(REQUIRED_SECTIONS.length);
    expect(missing[0]?.fix).toContain("is not a heading");
    expect(
      r.violations.filter((v) => v.code === "MISSING_SECTION" && v.severity === "warn"),
    ).toHaveLength(3);
    const plain = validateIssue(goodIssue({ description: "" })).violations[0];
    expect(plain?.fix).toContain("PaperOS Spec");
  });

  it("SECTION_ORDER warns only when required sections are out of the template order", () => {
    const base = goodIssue();
    const desc = base.description ?? "";
    // Move Size above Goal.
    const swapped = `**Size**\n\nM\n\n${desc.replace(/\*\*Size\*\*\n\nM\n?/, "")}`;
    const r = validateIssue({ ...base, description: swapped });
    expect(r.ok).toBe(true);
    expect(warnCodes(r)).toContain("SECTION_ORDER");
    // Recommended sections may sit anywhere.
    const demoFirst = `**Demo**\n\nx\n\n${desc.replace(/\*\*Demo\*\*\n\n[^\n]*\n?/, "")}`;
    expect(warnCodes(validateIssue({ ...base, description: demoFirst }))).not.toContain(
      "SECTION_ORDER",
    );
  });

  it("BAD_SIZE only when Size is present and not S/M/L", () => {
    const base = goodIssue();
    const desc = base.description ?? "";
    expect(
      errorCodes(
        validateIssue({
          ...base,
          description: desc.replace(/\*\*Size\*\*\n\nM/, "**Size**\n\nHuge"),
        }),
      ),
    ).toEqual(["BAD_SIZE"]);
    expect(
      errorCodes(
        validateIssue({ ...base, description: desc.replace(/\*\*Size\*\*\n\nM/, "**Size**\n\n") }),
      ),
    ).toEqual(["EMPTY_SECTION"]);
  });

  it("labels may arrive as `Group/Child` names without a group field; bare surface names count", () => {
    const r = validateIssue(
      goodIssue({
        labels: [
          { name: "Phase/P1" },
          { name: "Type/Docs" },
          { name: "Developer" },
          { name: "Character/Quill" },
        ],
      }),
    );
    expect(r.ok).toBe(true);
    expect(warnCodes(r)).not.toContain("LABEL_CHARACTER");
  });

  it("LABEL_CHARACTER warns when missing and can be switched off", () => {
    const issue = goodIssue({ labels: goodIssue().labels.filter((l) => l.group !== "Character") });
    expect(warnCodes(validateIssue(issue))).toContain("LABEL_CHARACTER");
    expect(warnCodes(validateIssue(issue, { characterLabelWarn: false }))).not.toContain(
      "LABEL_CHARACTER",
    );
  });

  it("reports multiple labels of one group with their names", () => {
    const r = validateIssue(
      goodIssue({
        labels: [...goodIssue().labels, { name: "Build", group: "Type" }],
      }),
    );
    expect(r.violations.find((v) => v.code === "LABEL_TYPE")?.message).toContain("Spec, Build");
  });
});

describe("NO_SPEC_LINK", () => {
  const build = (scopeLine: string, extra: object = {}) => {
    const base = goodIssue({
      labels: [
        { name: "P0", group: "Phase" },
        { name: "Build", group: "Type" },
        { name: "Staff", group: "Surface" },
        { name: "Atlas", group: "Character" },
      ],
      ...extra,
    });
    return {
      ...base,
      description: (base.description ?? "").replace("**Scope**\n\n", `**Scope**\n\n${scopeLine}\n`),
    };
  };

  it("warns before the strict date, errors after, only for Type/Build with a route", () => {
    const issue = build("* Route `/staff/contracts/:id` in the staff app.");
    const before = validateIssue(issue, { now: () => new Date("2026-09-19T12:00:00Z") });
    expect(before.ok).toBe(true);
    expect(warnCodes(before)).toContain("NO_SPEC_LINK");
    expect(before.violations.find((v) => v.code === "NO_SPEC_LINK")?.message).toContain(
      "Warning until 2026-09-22",
    );
    const after = validateIssue(issue, { now: () => new Date("2026-09-22T00:00:00Z") });
    expect(errorCodes(after)).toEqual(["NO_SPEC_LINK"]);
    const moved = validateIssue(issue, {
      now: () => new Date("2026-09-22T00:00:00Z"),
      strictSpecLinkFrom: "2026-10-01",
    });
    expect(moved.ok).toBe(true);
    expect(
      validateIssue(build("* No routes here."), { now: () => new Date("2026-09-30T00:00:00Z") }).ok,
    ).toBe(true);
  });

  it("is satisfied by a spec path, a Linear document link, an attachment or the parent", () => {
    const now = () => new Date("2026-10-01T00:00:00Z");
    expect(
      validateIssue(build("* Route `/settings`. Spec: specs/design-system/settings.spec.yaml"), {
        now,
      }).ok,
    ).toBe(true);
    expect(
      validateIssue(
        build("* Route `/settings`. See https://linear.app/paperos/document/x-abc123"),
        { now },
      ).ok,
    ).toBe(true);
    expect(
      validateIssue(
        build("* Route `/settings`.", {
          attachments: [{ url: "https://example.com/specs/x/y.spec.yaml" }],
        }),
        { now },
      ).ok,
    ).toBe(true);
    expect(
      validateIssue(
        build("* Route `/settings`.", {
          parent: { identifier: "PAP-0", description: "specs/a/b.spec.yml" },
        }),
        { now },
      ).ok,
    ).toBe(true);
    expect(hasSpecLink(build("* Route `/settings`."))).toBe(false);
  });

  it("scopeNamesRoute recognises URL paths and ignores filesystem paths and files", () => {
    expect(scopeNamesRoute("Route `/api/v1/tables/:id`")).toBe(true);
    expect(scopeNamesRoute("page /app/[tenant]/inbox and /settings/")).toBe(true);
    expect(scopeNamesRoute("worktree /workspace/wt/PAP-93")).toBe(false);
    expect(scopeNamesRoute("file /src/contract/validate.ts")).toBe(false);
    expect(scopeNamesRoute("In: `packages/contracts/`")).toBe(false);
    expect(scopeNamesRoute("")).toBe(false);
  });
});

describe("description length, exempt and intake states", () => {
  it("DESCRIPTION_TOO_LONG warns and truncates before parsing", () => {
    const base = goodIssue();
    const r = validateIssue({ ...base, description: `${base.description}\n${"x".repeat(60_000)}` });
    expect(r.ok).toBe(true);
    expect(warnCodes(r)).toContain("DESCRIPTION_TOO_LONG");
    const small = validateIssue(base, { maxDescriptionChars: 100 });
    expect(warnCodes(small)).toContain("DESCRIPTION_TOO_LONG");
    expect(errorCodes(small)).toContain("MISSING_SECTION");
  });

  it("Canceled and Duplicate issues are exempt; Triage downgrades shape errors to warnings", () => {
    const empty = goodIssue({ description: "", labels: [], project: null });
    expect(validateIssue({ ...empty, state: { name: "Canceled" } })).toEqual({
      ok: true,
      violations: [],
    });
    expect(validateIssue({ ...empty, state: { name: "Whatever", type: "duplicate" } }).ok).toBe(
      true,
    );
    const triage = validateIssue({ ...empty, state: { name: "Triage", type: "triage" } });
    expect(triage.ok).toBe(true);
    expect(warnCodes(triage)).toEqual(
      expect.arrayContaining([
        "MISSING_SECTION",
        "LABEL_PHASE",
        "LABEL_TYPE",
        "LABEL_SURFACE",
        "NO_PROJECT",
      ]),
    );
    // Readiness errors are never downgraded.
    const blockedTriage = validateIssue({
      ...goodIssue({ state: { name: "Triage" } }),
      blockedBy: [{ identifier: "PAP-1", state: { name: "Todo" } }],
    });
    expect(errorCodes(blockedTriage)).toEqual(["BLOCKED_BY_OPEN"]);
  });

  it("null description is treated as empty", () => {
    expect(errorCodes(validateIssue(goodIssue({ description: null })))).toContain(
      "MISSING_SECTION",
    );
  });
});

describe("config", () => {
  it("rejects an unknown mode and defaults to build-loop", () => {
    expect(resolveConfig().mode).toBe("build-loop");
    expect(() => resolveConfig({ mode: "yolo" as "pr-flow" })).toThrow(/contract mode/);
  });
});

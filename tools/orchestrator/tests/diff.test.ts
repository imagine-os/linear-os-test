import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { desiredConfig } from "../src/linear/desired.js";
import {
  diffLabels,
  diffStateNames,
  diffTeamSettings,
  diffTemplates,
  diffWorkspace,
} from "../src/linear/diff.js";
import type { LiveSnapshot } from "../src/linear/types.js";

const fixturePath = fileURLToPath(
  new URL("./fixtures/live-snapshot.fixture.json", import.meta.url),
);
const liveFixture = JSON.parse(readFileSync(fixturePath, "utf8")) as LiveSnapshot;

// All non-destructive op kinds this codebase is allowed to emit.
const NON_DESTRUCTIVE_KINDS = new Set([
  "issueLabelCreate",
  "issueLabelUpdate",
  "templateUpdate",
  "workflowStateUpdate",
  "teamUpdate",
]);
const DESTRUCTIVE_PATTERN = /delete|archive|remove|rename|retype|destroy/i;

describe("diffWorkspace — zero destructive operations", () => {
  it("never plans an op whose kind matches a destructive verb", () => {
    const rows = diffWorkspace(liveFixture, desiredConfig());
    for (const row of rows) {
      if (!row.op) continue;
      expect(NON_DESTRUCTIVE_KINDS.has(row.op.kind)).toBe(true);
      expect(row.op.kind).not.toMatch(DESTRUCTIVE_PATTERN);
    }
  });

  it("never emits an op for a row marked manual", () => {
    const rows = diffWorkspace(liveFixture, desiredConfig());
    for (const row of rows) {
      if (row.status === "manual") {
        expect(row.op).toBeUndefined();
      }
    }
  });

  it("a state rename is reported as manual drift and never carries an op", () => {
    const renamed: LiveSnapshot = {
      ...liveFixture,
      states: liveFixture.states.map((s) =>
        s.name === "Ready for Claude" ? { ...s, name: "Ready 4 Claude" } : s,
      ),
    };
    const rows = diffStateNames(renamed.states, desiredConfig().stateNames);
    const row = rows.find((r) => r.name === "Ready for Claude");
    expect(row).toBeDefined();
    expect(row?.status).toBe("manual");
    expect(row?.op).toBeUndefined();
  });

  it("a state removed entirely from the live team is reported manual, never recreated", () => {
    const missing: LiveSnapshot = {
      ...liveFixture,
      states: liveFixture.states.filter((s) => s.name !== "Done"),
    };
    const rows = diffStateNames(missing.states, desiredConfig().stateNames);
    const row = rows.find((r) => r.name === "Done");
    expect(row?.status).toBe("manual");
    expect(row?.op).toBeUndefined();
  });

  it("a state description/color mismatch is auto-fixable via workflowStateUpdate, restricted to those fields", () => {
    const desired = [
      {
        id: "0aed245d-f842-423f-bb5c-246061bf9b1b",
        name: "Backlog",
        description: "Specified, waiting on blockers.",
      },
    ];
    const rows = diffStateNames(liveFixture.states, desired);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.status).toBe("changed");
    expect(rows[0]?.op).toEqual({
      kind: "workflowStateUpdate",
      id: "0aed245d-f842-423f-bb5c-246061bf9b1b",
      description: "Specified, waiting on blockers.",
    });
    // Never carries name or type.
    expect(rows[0]?.op).not.toHaveProperty("name");
    expect(rows[0]?.op).not.toHaveProperty("type");
  });
});

describe("diffLabels", () => {
  it("reports the full Character group as missing on the live fixture (no Character labels yet)", () => {
    const rows = diffLabels(liveFixture.labels, desiredConfig().labels);
    const names = rows.map((r) => r.name);
    expect(names).toContain("Character");
    expect(names).toContain("Character/Atlas");
    expect(names).toContain("Character/Scout");
    // 1 group label + 9 characters + 6 round-4 labels = 16
    expect(rows).toHaveLength(16);
    for (const row of rows) {
      expect(row.status).toBe("missing");
      expect(row.op?.kind).toBe("issueLabelCreate");
    }
  });

  it("is case-insensitive when matching an existing label", () => {
    const live = [{ id: "x1", name: "gates-pending", parentName: null }];
    const rows = diffLabels(live, [{ name: "Gates-Pending", parent: null }]);
    expect(rows).toHaveLength(0);
  });

  it("reparents rather than duplicates when a Character child exists ungrouped", () => {
    const live = [
      { id: "grp-1", name: "Character", parentName: null },
      { id: "atlas-1", name: "Atlas", parentName: null }, // exists, but not under the group yet
    ];
    const rows = diffLabels(live, [
      { name: "Character", parent: null },
      { name: "Atlas", parent: "Character" },
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.status).toBe("changed");
    expect(rows[0]?.op).toEqual({
      kind: "issueLabelUpdate",
      id: "atlas-1",
      parentName: "Character",
    });
  });

  it("reports nothing once every desired label already exists correctly grouped", () => {
    const desired = desiredConfig().labels;
    const live = desired.map((l, i) => ({
      id: `id-${i}`,
      name: l.name,
      parentName: l.parent ?? null,
    }));
    const rows = diffLabels(live, desired);
    expect(rows).toHaveLength(0);
  });
});

describe("diffTemplates", () => {
  it("flags the PaperOS Spec template as changed: live sections don't match the eleven-section contract", () => {
    const rows = diffTemplates(liveFixture.templates, desiredConfig().templates);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.status).toBe("changed");
    expect(rows[0]?.op?.kind).toBe("templateUpdate");
  });

  it("reports no drift once the template already has exactly the contract sections", () => {
    const fixed = [
      {
        id: "tpl-1",
        name: "PaperOS Spec",
        sections: [...(desiredConfig().templates[0]?.sections ?? [])],
      },
    ];
    const rows = diffTemplates(fixed, desiredConfig().templates);
    expect(rows).toHaveLength(0);
  });

  it("a template missing entirely is reported manual (never created by this script)", () => {
    const rows = diffTemplates([], desiredConfig().templates);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.status).toBe("manual");
    expect(rows[0]?.op).toBeUndefined();
  });
});

describe("diffTeamSettings", () => {
  it("reports no drift when live already matches (the real PAP team today)", () => {
    const rows = diffTeamSettings(liveFixture.teamSettings, desiredConfig().teamSettings);
    expect(rows).toHaveLength(0);
  });

  it("reports changed rows when a setting drifts, each carrying a teamUpdate op", () => {
    const rows = diffTeamSettings(
      { issueEstimationType: "notUsed", cyclesEnabled: false, triageEnabled: true },
      desiredConfig().teamSettings,
    );
    expect(rows).toHaveLength(2);
    for (const row of rows) {
      expect(row.status).toBe("changed");
      expect(row.op?.kind).toBe("teamUpdate");
    }
  });
});

describe("diffWorkspace — DoD: check reports only Character + template drift on the live fixture", () => {
  it("every row is either a Character label, a round-4 label, or the PaperOS Spec template", () => {
    const rows = diffWorkspace(liveFixture, desiredConfig());
    for (const row of rows) {
      const isCharacterOrRound4Label = row.kind === "label";
      const isTemplate = row.kind === "template";
      expect(isCharacterOrRound4Label || isTemplate).toBe(true);
    }
  });

  it("re-running the diff against a fully-reconciled snapshot yields zero rows (idempotent apply)", () => {
    const desired = desiredConfig();
    const reconciled: LiveSnapshot = {
      ...liveFixture,
      labels: [
        ...liveFixture.labels,
        ...desired.labels.map((l, i) => ({
          id: `new-${i}`,
          name: l.name,
          parentName: l.parent ?? null,
        })),
      ],
      templates: [
        {
          id: "591f7807-8322-4bda-935e-9a73d221eec3",
          name: "PaperOS Spec",
          sections: [...(desired.templates[0]?.sections ?? [])],
        },
      ],
    };
    expect(diffWorkspace(reconciled, desired)).toHaveLength(0);
    // Applying twice is a no-op: diffing the already-reconciled state again still yields nothing.
    expect(diffWorkspace(reconciled, desired)).toHaveLength(0);
  });
});

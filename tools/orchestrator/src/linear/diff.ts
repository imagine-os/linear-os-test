/**
 * Pure diff engine for the Linear workspace configuration (PAP-91).
 *
 * Design constraint, enforced structurally: the op union below has no
 * delete, archive, rename or retype variant, so nothing this module can
 * ever return is destructive. `configure-workspace.test.ts` also asserts
 * this behaviourally over the fixtures.
 */

import type {
  DesiredConfig,
  DesiredLabel,
  DesiredTemplate,
  LiveLabel,
  LiveSnapshot,
} from "./types.js";

export type DiffOp =
  // `parentName` (not an id) so the applier can resolve it after any group
  // label this same diff also creates, without the diff engine needing to
  // predict ids that don't exist yet.
  | { kind: "issueLabelCreate"; name: string; parentName?: string; color?: string }
  | { kind: "issueLabelUpdate"; id: string; parentName: string }
  | { kind: "templateUpdate"; id: string; body: string }
  // Never name or type — the interface contract's only allowed state mutation.
  | { kind: "workflowStateUpdate"; id: string; description?: string; color?: string }
  | {
      kind: "teamUpdate";
      issueEstimationType?: string;
      cyclesEnabled?: boolean;
      triageEnabled?: boolean;
    };

export type DiffStatus = "missing" | "changed" | "manual";

export interface DiffRow {
  kind: "label" | "template" | "state" | "teamSetting";
  name: string;
  field: string;
  live: string;
  wanted: string;
  status: DiffStatus;
  /** Present only when `status` is "missing" or "changed": what `--apply` will run. */
  op?: DiffOp;
}

function byNameCI(name: string) {
  return name.trim().toLowerCase();
}

function findLabel(
  labels: LiveLabel[],
  name: string,
  parent: string | null | undefined,
): LiveLabel | undefined {
  const wantParent = parent ? byNameCI(parent) : null;
  return labels.find((l) => {
    if (byNameCI(l.name) !== byNameCI(name)) return false;
    const liveParent = l.parentName ? byNameCI(l.parentName) : null;
    return liveParent === wantParent;
  });
}

/** A label with this exact name exists somewhere on the team, regardless of group. */
function findLabelAnyGroup(labels: LiveLabel[], name: string): LiveLabel | undefined {
  return labels.find((l) => byNameCI(l.name) === byNameCI(name));
}

export function diffLabels(live: LiveLabel[], desired: DesiredLabel[]): DiffRow[] {
  const rows: DiffRow[] = [];
  for (const want of desired) {
    const exact = findLabel(live, want.name, want.parent ?? null);
    if (exact) continue; // already correct: not reported (check output stays to drift only)

    const anyGroup = findLabelAnyGroup(live, want.name);
    const displayName = want.parent ? `${want.parent}/${want.name}` : want.name;

    if (anyGroup && want.parent) {
      // Edge case: a Character child already exists ungrouped -> reparent, never duplicate.
      rows.push({
        kind: "label",
        name: displayName,
        field: "parentId",
        live: anyGroup.parentName ? `${anyGroup.parentName}/${anyGroup.name}` : "(ungrouped)",
        wanted: displayName,
        status: "changed",
        op: { kind: "issueLabelUpdate", id: anyGroup.id, parentName: want.parent },
      });
      continue;
    }

    rows.push({
      kind: "label",
      name: displayName,
      field: "exists",
      live: "(none)",
      wanted: displayName,
      status: "missing",
      op: {
        kind: "issueLabelCreate",
        name: want.name,
        parentName: want.parent ?? undefined,
        color: want.color,
      },
    });
  }
  return rows;
}

export function diffTemplates(
  live: LiveSnapshot["templates"],
  desired: DesiredTemplate[],
): DiffRow[] {
  const rows: DiffRow[] = [];
  for (const want of desired) {
    const liveTpl = live.find((t) => byNameCI(t.name) === byNameCI(want.name));
    if (!liveTpl) {
      // Templates are never created by this script (Linear ships them; PAP-91 only
      // updates bodies), so a missing template is reported but not auto-fixed.
      rows.push({
        kind: "template",
        name: want.name,
        field: "exists",
        live: "(none)",
        wanted: want.sections.join(" > "),
        status: "manual",
      });
      continue;
    }
    const same =
      liveTpl.sections.length === want.sections.length &&
      liveTpl.sections.every((s, i) => byNameCI(s) === byNameCI(want.sections[i] ?? ""));
    if (!same) {
      rows.push({
        kind: "template",
        name: want.name,
        field: "sections",
        live: liveTpl.sections.join(" > "),
        wanted: want.sections.join(" > "),
        status: "changed",
        op: { kind: "templateUpdate", id: liveTpl.id, body: want.body },
      });
    }
  }
  return rows;
}

export function diffStateNames(
  live: LiveSnapshot["states"],
  desired: DesiredConfig["stateNames"],
): DiffRow[] {
  const rows: DiffRow[] = [];
  for (const want of desired) {
    const liveState = live.find((s) => s.id === want.id);
    if (!liveState) {
      // The state itself is gone from the workspace entirely: report, never recreate here.
      rows.push({
        kind: "state",
        name: want.name,
        field: "exists",
        live: "(missing)",
        wanted: want.name,
        status: "manual",
      });
      continue;
    }
    if (byNameCI(liveState.name) !== byNameCI(want.name)) {
      rows.push({
        kind: "state",
        name: want.name,
        field: "name",
        live: liveState.name,
        wanted: want.name,
        status: "manual", // never rename back — report only (edge case in spec)
      });
    }

    // description/color are the only fields workflowStateUpdate may ever touch.
    if (want.description !== undefined && (liveState.description ?? "") !== want.description) {
      rows.push({
        kind: "state",
        name: want.name,
        field: "description",
        live: liveState.description ?? "(none)",
        wanted: want.description,
        status: "changed",
        op: { kind: "workflowStateUpdate", id: liveState.id, description: want.description },
      });
    }
    if (want.color !== undefined && (liveState.color ?? "") !== want.color) {
      rows.push({
        kind: "state",
        name: want.name,
        field: "color",
        live: liveState.color ?? "(none)",
        wanted: want.color,
        status: "changed",
        op: { kind: "workflowStateUpdate", id: liveState.id, color: want.color },
      });
    }
  }
  return rows;
}

export function diffTeamSettings(
  live: LiveSnapshot["teamSettings"],
  desired: DesiredConfig["teamSettings"],
): DiffRow[] {
  const rows: DiffRow[] = [];
  const fields: (keyof typeof desired)[] = [
    "issueEstimationType",
    "cyclesEnabled",
    "triageEnabled",
  ];
  const op: DiffOp = { kind: "teamUpdate" };
  let any = false;
  for (const field of fields) {
    if (live[field] !== desired[field]) {
      any = true;
      (op as Record<string, unknown>)[field] = desired[field];
      rows.push({
        kind: "teamSetting",
        name: field,
        field,
        live: String(live[field]),
        wanted: String(desired[field]),
        status: "changed",
        op,
      });
    }
  }
  return any ? rows : [];
}

/** Full diff. Rows are drift only — an item that already matches is silent,
 * so an empty array means "nothing to do" (the `--check` contract). */
export function diffWorkspace(live: LiveSnapshot, desired: DesiredConfig): DiffRow[] {
  return [
    ...diffLabels(live.labels, desired.labels),
    ...diffTemplates(live.templates, desired.templates),
    ...diffStateNames(live.states, desired.stateNames),
    ...diffTeamSettings(live.teamSettings, desired.teamSettings),
  ];
}

/** Renders the `(kind, name, field, live, wanted)` table the spec's `--check` prints. */
export function renderDiffTable(rows: DiffRow[]): string {
  if (rows.length === 0) return "(no drift)";
  const header = ["kind", "name", "field", "live", "wanted", "status"];
  const lines = [header, ...rows.map((r) => [r.kind, r.name, r.field, r.live, r.wanted, r.status])];
  const widths = header.map((_, i) => Math.max(...lines.map((l) => (l[i] ?? "").length)));
  return lines
    .map((l) => l.map((cell, i) => (cell ?? "").padEnd(widths[i] ?? 0)).join("  "))
    .join("\n");
}

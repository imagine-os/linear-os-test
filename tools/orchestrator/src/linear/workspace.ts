/**
 * Types and loader for `linear-workspace.json`, the committed snapshot of
 * every id a downstream script needs (states, labels, templates, projects,
 * cycles, team settings). Produced by `ops/linear/configure-workspace.ts`.
 *
 * Consumers: PAP-93 (label/state ids), PAP-96 (state ids for claims),
 * PAP-99 (Character routing), PAP-22 (`paperos create` reuses the script).
 */

/** Team-level settings the workspace script treats as facts, never mutates
 * destructively, and reports drift on as `manual`. */
export interface TeamSettings {
  issueEstimationType: string;
  cyclesEnabled: boolean;
  triageEnabled: boolean;
}

export interface WorkspaceIds {
  /** Schema version of this file, bumped on breaking shape changes. */
  version: 1;
  /** ISO timestamp this snapshot was written. */
  generatedAt: string;
  team: {
    id: string;
    key: string;
    name: string;
  };
  /** State name -> workflow state id (e.g. "Ready for Claude"). */
  states: Record<string, string>;
  /**
   * Label name -> label id. Grouped labels are keyed `"Group/Child"`
   * (e.g. `"Phase/P0"`, `"Character/Atlas"`); ungrouped labels and group
   * labels themselves are keyed by their plain name (e.g. `"Customer"`,
   * `"Character"`).
   */
  labels: Record<string, string>;
  /** Issue/project template name -> template id. */
  templates: Record<string, string>;
  /** Project name -> project id. */
  projects: Record<string, string>;
  /** Cycle name -> cycle id. */
  cycles: Record<string, string>;
  teamSettings: TeamSettings;
}

/**
 * Loads `linear-workspace.json` from the repo root (or a path override).
 * Throws with a clear message if the file is missing or malformed, since
 * every consumer depends on ids existing.
 */
export async function loadWorkspaceIds(path = "linear-workspace.json"): Promise<WorkspaceIds> {
  const fs = await import("node:fs/promises");
  let raw: string;
  try {
    raw = await fs.readFile(path, "utf8");
  } catch (err) {
    throw new Error(
      `linear-workspace.json not found at "${path}". Run "pnpm linear:configure --apply" first. (${
        (err as Error).message
      })`,
    );
  }
  const parsed = JSON.parse(raw) as WorkspaceIds;
  if (parsed.version !== 1) {
    throw new Error(`linear-workspace.json has unsupported version ${String(parsed.version)}`);
  }
  return parsed;
}

/** Look up a grouped label id (`"Character/Atlas"`) or throw with a clear message. */
export function requireLabel(ids: WorkspaceIds, key: string): string {
  const id = ids.labels[key];
  if (!id) {
    throw new Error(`label "${key}" is missing from linear-workspace.json`);
  }
  return id;
}

/** Look up a state id by name (`"Ready for Claude"`) or throw with a clear message. */
export function requireState(ids: WorkspaceIds, name: string): string {
  const id = ids.states[name];
  if (!id) {
    throw new Error(`state "${name}" is missing from linear-workspace.json`);
  }
  return id;
}

/** The nine PaperOS agent characters, in roster order. */
export const CHARACTERS = [
  "Atlas",
  "Forge",
  "Iris",
  "Quill",
  "Sentinel",
  "Nova",
  "Ledger",
  "Beacon",
  "Scout",
] as const;

export type Character = (typeof CHARACTERS)[number];

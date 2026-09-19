/** Shared types for the workspace-configuration diff engine (PAP-91).
 * Pure data shapes only — no network or SDK imports here, so `diff.ts` stays
 * unit-testable against fixtures with no live Linear access. */

export interface LiveLabel {
  id: string;
  name: string;
  color?: string;
  /** Name of the parent (group) label, or null/undefined if ungrouped or a group itself. */
  parentName?: string | null;
}

export interface LiveTemplate {
  id: string;
  name: string;
  /** Section headings (level-2 headings) found in the template's description, in order. */
  sections: string[];
}

export interface LiveState {
  id: string;
  name: string;
  type: string;
  description?: string | null;
  color?: string | null;
}

export interface LiveTeamSettings {
  issueEstimationType: string;
  cyclesEnabled: boolean;
  triageEnabled: boolean;
}

export interface LiveSnapshot {
  team: { id: string; key: string; name: string };
  states: LiveState[];
  labels: LiveLabel[];
  templates: LiveTemplate[];
  projects: { id: string; name: string }[];
  cycles: { id: string; name: string }[];
  teamSettings: LiveTeamSettings;
}

/** One label to ensure exists, optionally nested under a parent group label. */
export interface DesiredLabel {
  name: string;
  /** Name of the parent group label; undefined/null for a top-level or group label. */
  parent?: string | null;
  color?: string;
}

/** One issue/project template whose body must contain exactly these section headings, in order. */
export interface DesiredTemplate {
  name: string;
  sections: string[];
  /** Full markdown body to write when the template needs updating. */
  body: string;
}

/** A workflow state identified by its live id, pinned to an expected name.
 * Used only to detect "someone renamed a state" drift — never to create or
 * retype states. */
export interface DesiredStateName {
  id: string;
  name: string;
  /** Optional description/color to converge on via `workflowStateUpdate` —
   * the only two fields this script is ever allowed to change on a state.
   * Undefined means "don't touch"; PAP-91 sets neither today because the
   * live states already match. */
  description?: string;
  color?: string;
}

export interface DesiredConfig {
  team: { key: string };
  labels: DesiredLabel[];
  templates: DesiredTemplate[];
  stateNames: DesiredStateName[];
  teamSettings: LiveTeamSettings;
}

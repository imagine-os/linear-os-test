/**
 * Fetches the live workspace snapshot the diff engine compares against.
 *
 * Issued as several small queries rather than one query nesting every
 * connection under `teams(filter:...)`, because the combined nested
 * connections (states + labels + templates + projects + cycles, each up
 * to first:250) blow Linear's per-query complexity budget (10,000) — a
 * single `teams(filter:...) { nodes { labels(first:250) { ... } } }`
 * measured over 57,000. Splitting by connection keeps each query cheap and
 * still costs far less than the 5,000 req/hour limit for one `--check`.
 */

import type { LinearClient } from "@linear/sdk";
import { rawRequestWithRetry } from "./client.js";
import type { LiveSnapshot } from "./types.js";

const TEAM_META_QUERY = /* GraphQL */ `
  query TeamMeta($teamKey: String!) {
    teams(filter: { key: { eq: $teamKey } }) {
      nodes {
        id
        key
        name
        issueEstimationType
        cyclesEnabled
        triageEnabled
      }
    }
  }
`;

const STATES_QUERY = /* GraphQL */ `
  query TeamStates($teamId: String!) {
    team(id: $teamId) {
      states(first: 100) {
        nodes {
          id
          name
          type
          description
          color
        }
      }
    }
  }
`;

const LABELS_QUERY = /* GraphQL */ `
  query TeamLabels($teamId: String!) {
    team(id: $teamId) {
      labels(first: 250) {
        nodes {
          id
          name
          color
          parent {
            id
            name
          }
        }
      }
    }
  }
`;

const TEMPLATES_QUERY = /* GraphQL */ `
  query TeamTemplates($teamId: String!) {
    team(id: $teamId) {
      templates(first: 100) {
        nodes {
          id
          name
          templateData
        }
      }
    }
  }
`;

const PROJECTS_QUERY = /* GraphQL */ `
  query TeamProjects($teamId: String!) {
    team(id: $teamId) {
      projects(first: 100) {
        nodes {
          id
          name
        }
      }
    }
  }
`;

const CYCLES_QUERY = /* GraphQL */ `
  query TeamCycles($teamId: String!) {
    team(id: $teamId) {
      cycles(first: 20) {
        nodes {
          id
          name
        }
      }
    }
  }
`;

interface RawTeamMeta {
  id: string;
  key: string;
  name: string;
  issueEstimationType: string;
  cyclesEnabled: boolean;
  triageEnabled: boolean;
}

/** Walks a Linear template's ProseMirror `descriptionData` and returns the
 * text of every level-2 heading, in document order — the section names a
 * PaperOS spec template presents. */
export function extractSections(templateDataJson: string): string[] {
  let doc: unknown;
  try {
    doc = JSON.parse(templateDataJson);
  } catch {
    return [];
  }
  const descriptionData = (doc as { descriptionData?: unknown }).descriptionData;
  const sections: string[] = [];
  walkHeadings(descriptionData, sections);
  return sections;
}

function walkHeadings(node: unknown, out: string[]): void {
  if (!node || typeof node !== "object") return;
  const n = node as {
    type?: string;
    attrs?: { level?: number; originalNodeData?: unknown };
    content?: unknown[];
  };
  if (n.type === "heading" && n.attrs?.level === 2) {
    const text = (n.content ?? [])
      .map((c) => (c as { text?: string }).text ?? "")
      .join("")
      .trim();
    if (text) out.push(text);
    return;
  }
  // Linear falls back to this wrapper when a doc it's given doesn't parse
  // against its ProseMirror schema (e.g. a heading missing a required
  // attr); the original content survives underneath, so recurse into it
  // rather than reading the section list as empty.
  if (n.type === "unsupported_block_node" && n.attrs?.originalNodeData) {
    walkHeadings(n.attrs.originalNodeData, out);
    return;
  }
  for (const child of n.content ?? []) {
    walkHeadings(child, out);
  }
}

export async function fetchLiveSnapshot(
  client: LinearClient,
  teamKey: string,
): Promise<LiveSnapshot> {
  const meta = await rawRequestWithRetry<{ teams: { nodes: RawTeamMeta[] } }>(
    client,
    TEAM_META_QUERY,
    {
      teamKey,
    },
  );
  const team = meta.teams.nodes[0];
  if (!team) {
    throw new Error(`No team found with key "${teamKey}"`);
  }
  const teamId = team.id;

  const [statesRes, labelsRes, templatesRes, projectsRes, cyclesRes] = await Promise.all([
    rawRequestWithRetry<{
      team: {
        states: {
          nodes: {
            id: string;
            name: string;
            type: string;
            description?: string | null;
            color?: string | null;
          }[];
        };
      };
    }>(client, STATES_QUERY, { teamId }),
    rawRequestWithRetry<{
      team: {
        labels: {
          nodes: {
            id: string;
            name: string;
            color?: string;
            parent?: { id: string; name: string } | null;
          }[];
        };
      };
    }>(client, LABELS_QUERY, { teamId }),
    rawRequestWithRetry<{
      team: { templates: { nodes: { id: string; name: string; templateData: string }[] } };
    }>(client, TEMPLATES_QUERY, { teamId }),
    rawRequestWithRetry<{ team: { projects: { nodes: { id: string; name: string }[] } } }>(
      client,
      PROJECTS_QUERY,
      {
        teamId,
      },
    ),
    rawRequestWithRetry<{ team: { cycles: { nodes: { id: string; name: string }[] } } }>(
      client,
      CYCLES_QUERY,
      {
        teamId,
      },
    ),
  ]);

  return {
    team: { id: team.id, key: team.key, name: team.name },
    states: statesRes.team.states.nodes.map((s) => ({
      id: s.id,
      name: s.name,
      type: s.type,
      description: s.description,
      color: s.color,
    })),
    labels: labelsRes.team.labels.nodes.map((l) => ({
      id: l.id,
      name: l.name,
      color: l.color,
      parentName: l.parent?.name ?? null,
    })),
    templates: templatesRes.team.templates.nodes.map((t) => ({
      id: t.id,
      name: t.name,
      sections: extractSections(t.templateData),
    })),
    projects: projectsRes.team.projects.nodes,
    cycles: cyclesRes.team.cycles.nodes,
    teamSettings: {
      issueEstimationType: team.issueEstimationType,
      cyclesEnabled: team.cyclesEnabled,
      triageEnabled: team.triageEnabled,
    },
  };
}

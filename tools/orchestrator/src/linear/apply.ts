/**
 * Executes the ops a `DiffRow[]` from `diff.ts` names. Only three mutation
 * shapes are ever issued — `issueLabelCreate`, `issueLabelUpdate`
 * (parent only), `templateUpdate` (description/data only) — plus
 * `teamUpdate` for the three named settings fields. Nothing here can
 * delete, archive, rename an existing label/state, or retype anything, so
 * "zero destructive operations ever planned" holds by construction.
 */

import type { LinearClient } from "@linear/sdk";
import { rawRequestWithRetry } from "./client.js";
import { specTemplateDoc } from "./desired.js";
import type { DiffOp, DiffRow } from "./diff.js";

const LABEL_CREATE = /* GraphQL */ `
  mutation ApplyLabelCreate($input: IssueLabelCreateInput!) {
    issueLabelCreate(input: $input) {
      success
      issueLabel {
        id
        name
      }
    }
  }
`;

const LABEL_UPDATE = /* GraphQL */ `
  mutation ApplyLabelUpdate($id: String!, $input: IssueLabelUpdateInput!) {
    issueLabelUpdate(id: $id, input: $input) {
      success
    }
  }
`;

const TEMPLATE_UPDATE = /* GraphQL */ `
  mutation ApplyTemplateUpdate($id: String!, $input: TemplateUpdateInput!) {
    templateUpdate(id: $id, input: $input) {
      success
    }
  }
`;

const WORKFLOW_STATE_UPDATE = /* GraphQL */ `
  mutation ApplyWorkflowStateUpdate($id: String!, $input: WorkflowStateUpdateInput!) {
    workflowStateUpdate(id: $id, input: $input) {
      success
    }
  }
`;

const TEAM_UPDATE = /* GraphQL */ `
  mutation ApplyTeamUpdate($id: String!, $input: TeamUpdateInput!) {
    teamUpdate(id: $id, input: $input) {
      success
    }
  }
`;

export interface ApplyResult {
  applied: DiffRow[];
  skippedManual: DiffRow[];
  /** name -> id, for every label this run created or already found, so the
   * final `linear-workspace.json` can be written from one map. */
  createdLabelIds: Record<string, string>;
}

export async function applyDiff(
  client: LinearClient,
  teamId: string,
  rows: DiffRow[],
  existingLabelIds: Record<string, string>,
): Promise<ApplyResult> {
  const applied: DiffRow[] = [];
  const skippedManual: DiffRow[] = [];
  const labelIds = { ...existingLabelIds };

  // Apply label creates group-before-child so `parentName` always resolves,
  // by sorting rows so entries with no parent (or whose parent is already
  // known) go first; a single pass is enough because our desired config is
  // only one level deep (Character group + its nine children).
  const labelRows = rows.filter((r) => r.kind === "label" && r.op);
  const otherRows = rows.filter((r) => r.kind !== "label");

  const order = [...labelRows].sort((a, b) => {
    const aHasParent = a.op && "parentName" in a.op && a.op.parentName;
    const bHasParent = b.op && "parentName" in b.op && b.op.parentName;
    return (aHasParent ? 1 : 0) - (bHasParent ? 1 : 0);
  });

  for (const row of order) {
    if (row.status === "manual" || !row.op) {
      skippedManual.push(row);
      continue;
    }
    await applyOp(client, teamId, row.op, labelIds);
    applied.push(row);
  }

  for (const row of otherRows) {
    if (row.status === "manual" || !row.op) {
      skippedManual.push(row);
      continue;
    }
    await applyOp(client, teamId, row.op, labelIds);
    applied.push(row);
  }

  return { applied, skippedManual, createdLabelIds: labelIds };
}

async function applyOp(
  client: LinearClient,
  teamId: string,
  op: DiffOp,
  labelIds: Record<string, string>,
): Promise<void> {
  switch (op.kind) {
    case "issueLabelCreate": {
      const parentId = op.parentName ? labelIds[op.parentName] : undefined;
      if (op.parentName && !parentId) {
        throw new Error(
          `cannot create label "${op.name}": parent "${op.parentName}" was not created/found first`,
        );
      }
      const data = await rawRequestWithRetry<{
        issueLabelCreate: { success: boolean; issueLabel: { id: string; name: string } };
      }>(client, LABEL_CREATE, {
        input: {
          name: op.name,
          teamId,
          parentId,
          isGroup: !op.parentName,
          color: op.color,
        },
      });
      if (!data.issueLabelCreate.success) {
        throw new Error(`issueLabelCreate failed for "${op.name}"`);
      }
      labelIds[op.name] = data.issueLabelCreate.issueLabel.id;
      return;
    }
    case "issueLabelUpdate": {
      const parentId = labelIds[op.parentName];
      if (!parentId) {
        throw new Error(`cannot reparent label ${op.id}: parent "${op.parentName}" unresolved`);
      }
      const data = await rawRequestWithRetry<{ issueLabelUpdate: { success: boolean } }>(
        client,
        LABEL_UPDATE,
        { id: op.id, input: { parentId } },
      );
      if (!data.issueLabelUpdate.success) {
        throw new Error(`issueLabelUpdate failed for ${op.id}`);
      }
      return;
    }
    case "templateUpdate": {
      const data = await rawRequestWithRetry<{ templateUpdate: { success: boolean } }>(
        client,
        TEMPLATE_UPDATE,
        {
          id: op.id,
          input: {
            description: op.body,
            templateData: JSON.stringify({ title: "", descriptionData: specTemplateDoc() }),
          },
        },
      );
      if (!data.templateUpdate.success) {
        throw new Error(`templateUpdate failed for ${op.id}`);
      }
      return;
    }
    case "workflowStateUpdate": {
      // Only description/color ever go in this input — never name or type,
      // per the interface contract ("workflowStateUpdate only for
      // description and color, never name or type").
      const input: Record<string, unknown> = {};
      if (op.description !== undefined) input.description = op.description;
      if (op.color !== undefined) input.color = op.color;
      const data = await rawRequestWithRetry<{ workflowStateUpdate: { success: boolean } }>(
        client,
        WORKFLOW_STATE_UPDATE,
        { id: op.id, input },
      );
      if (!data.workflowStateUpdate.success) {
        throw new Error(`workflowStateUpdate failed for ${op.id}`);
      }
      return;
    }
    case "teamUpdate": {
      const input: Record<string, unknown> = {};
      if (op.issueEstimationType !== undefined) input.issueEstimationType = op.issueEstimationType;
      if (op.cyclesEnabled !== undefined) input.cyclesEnabled = op.cyclesEnabled;
      if (op.triageEnabled !== undefined) input.triageEnabled = op.triageEnabled;
      const data = await rawRequestWithRetry<{ teamUpdate: { success: boolean } }>(
        client,
        TEAM_UPDATE,
        { id: teamId, input },
      );
      if (!data.teamUpdate.success) {
        throw new Error(`teamUpdate failed for team ${teamId}`);
      }
      return;
    }
  }
}

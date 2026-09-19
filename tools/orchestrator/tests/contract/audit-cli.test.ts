import { describe, expect, it } from "vitest";
import { auditNodes, parseArgs, renderReport, runAudit } from "../../src/cli/contract-audit.js";
import {
  type LinearIssueNode,
  prFromAttachments,
  toContractIssue,
} from "../../src/contract/linear-issue.js";

function node(overrides: Partial<LinearIssueNode> = {}): LinearIssueNode {
  return {
    id: "n1",
    identifier: "PAP-42",
    title: "t",
    description:
      "**Goal**\n\ng\n\n**Scope**\n\ns\n\n**Spec**\n\nx\n\n**Definition of done**\n\nd\n\n**Edge cases**\n\ne\n\n**Dependencies**\n\nNone\n\n**Agent**\n\nAtlas\n\n**Size**\n\nS",
    branchName: "jmassion/pap-42-t",
    state: { name: "Backlog", type: "backlog" },
    project: { id: "p", name: "P" },
    parent: null,
    children: { nodes: [] },
    labels: {
      nodes: [
        { id: "l1", name: "P0", parent: { name: "Phase" } },
        { id: "l2", name: "Build", parent: { name: "Type" } },
        { id: "l3", name: "Agent", parent: { name: "Surface" } },
        { id: "l4", name: "Deferred", parent: null },
      ],
    },
    attachments: { nodes: [] },
    inverseRelations: {
      nodes: [
        {
          type: "blocks",
          issue: {
            identifier: "PAP-1",
            branchName: "feat/PAP-1",
            state: { name: "In Review" },
            attachments: { nodes: [] },
          },
        },
        { type: "related", issue: { identifier: "PAP-2", state: { name: "Backlog" } } },
        {
          type: "blocks",
          issue: {
            identifier: "PAP-3",
            state: { name: "In Review" },
            attachments: {
              nodes: [{ url: "https://github.com/o/r/pull/9", sourceType: "github" }],
            },
          },
        },
      ],
    },
    ...overrides,
  };
}

describe("toContractIssue", () => {
  it("maps labels with groups, inbound blocks only, PR attachments, parent and children", () => {
    const issue = toContractIssue(
      node({
        parent: { id: "pp", identifier: "PAP-40", description: "specs/a/b.spec.yaml" },
        children: { nodes: [{ id: "c", identifier: "PAP-43", state: { name: "Done" } }] },
      }),
      {
        prForBranch: (b) => (b === "feat/PAP-1" ? { url: "pr-1", open: true } : undefined),
        claimTarget: true,
      },
    );
    expect(issue.labels).toEqual([
      { name: "P0", group: "Phase" },
      { name: "Build", group: "Type" },
      { name: "Agent", group: "Surface" },
      { name: "Deferred", group: null },
    ]);
    expect(issue.blockedBy.map((b) => b.identifier)).toEqual(["PAP-1", "PAP-3"]);
    expect(issue.blockedBy[0]?.pr).toEqual({ url: "pr-1", open: true });
    expect(issue.blockedBy[1]?.pr).toEqual({ url: "https://github.com/o/r/pull/9", open: true });
    expect(issue.parent).toEqual({ identifier: "PAP-40", description: "specs/a/b.spec.yaml" });
    expect(issue.children).toEqual([{ identifier: "PAP-43", state: { name: "Done" } }]);
    expect(issue.claimTarget).toBe(true);
    const plain = toContractIssue(node());
    expect(plain.claimTarget).toBeUndefined();
    expect(plain.blockedBy[0]?.pr).toBeNull();
    expect(plain.parent).toBeNull();
  });

  it("prFromAttachments detects GitHub PRs by url or sourceType", () => {
    expect(prFromAttachments(undefined)).toBeUndefined();
    expect(prFromAttachments([{ url: "https://x/y" }])).toBeUndefined();
    expect(prFromAttachments([{ url: "https://github.com/a/b/pull/1" }])).toEqual({
      url: "https://github.com/a/b/pull/1",
      open: true,
    });
  });
});

describe("auditNodes / renderReport / parseArgs", () => {
  it("audits nodes in the requested mode and flags Deferred", () => {
    const buildLoop = auditNodes([node()], "build-loop");
    expect(buildLoop.rows[0]).toMatchObject({ identifier: "PAP-42", errors: [], deferred: true });
    const prFlow = auditNodes([node()], "pr-flow");
    expect(prFlow.rows[0]?.errors).toEqual(["BLOCKED_BY_OPEN"]);
    expect(prFlow.details[0]?.violations.some((v) => v.code === "BLOCKED_BY_OPEN")).toBe(true);
  });

  it("parseArgs reads flags and rejects a bad mode", () => {
    const a = parseArgs([
      "--state",
      "Backlog",
      "--mode",
      "pr-flow",
      "--only-errors",
      "--max-rows",
      "5",
      "--json",
      "--strict-readiness",
      "--from",
      "f.json",
      "--out",
      "o.md",
      "--issue",
      "PAP-1",
      "--team",
      "PAP",
    ]);
    expect(a).toEqual({
      state: "Backlog",
      issue: "PAP-1",
      mode: "pr-flow",
      onlyErrors: true,
      maxRows: 5,
      json: true,
      strictReadiness: true,
      from: "f.json",
      out: "o.md",
      team: "PAP",
    });
    expect(parseArgs([]).mode).toBe("build-loop");
    expect(() => parseArgs(["--mode", "x"])).toThrow(/--mode/);
  });

  it("runAudit --from replays a file with state and issue filters; renderReport titles the scope", async () => {
    const { writeFileSync, mkdtempSync } = await import("node:fs");
    const { join } = await import("node:path");
    const { tmpdir } = await import("node:os");
    const dir = mkdtempSync(join(tmpdir(), "audit-"));
    const file = join(dir, "team.json");
    writeFileSync(
      file,
      JSON.stringify([
        node(),
        node({ id: "n2", identifier: "PAP-43", state: { name: "Triage", type: "triage" } }),
      ]),
    );
    const all = await runAudit(parseArgs(["--from", file]));
    expect(all.rows).toHaveLength(2);
    expect(all.pages).toBe(1);
    const backlog = await runAudit(parseArgs(["--from", file, "--state", "Backlog"]));
    expect(backlog.rows.map((r) => r.identifier)).toEqual(["PAP-42"]);
    const one = await runAudit(parseArgs(["--from", file, "--issue", "PAP-43"]));
    expect(one.rows.map((r) => r.identifier)).toEqual(["PAP-43"]);
    const md = renderReport(backlog, parseArgs(["--from", file, "--state", "Backlog"]));
    expect(md).toContain("state Backlog, mode build-loop");
    expect(md).not.toContain("Linear complexity");
    expect(
      renderReport({ ...one, complexity: 830, pages: 1 }, parseArgs(["--issue", "PAP-43"])),
    ).toContain("Linear complexity 830 total");
    expect(renderReport(all, parseArgs([]))).toContain("whole team");
  });
});

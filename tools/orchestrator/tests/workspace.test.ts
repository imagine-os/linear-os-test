import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  CHARACTERS,
  loadWorkspaceIds,
  requireLabel,
  requireState,
} from "../src/linear/workspace.js";

describe("CHARACTERS", () => {
  it("names exactly the nine PaperOS agent characters", () => {
    expect(CHARACTERS).toEqual([
      "Atlas",
      "Forge",
      "Iris",
      "Quill",
      "Sentinel",
      "Nova",
      "Ledger",
      "Beacon",
      "Scout",
    ]);
  });
});

describe("loadWorkspaceIds / requireLabel / requireState", () => {
  let dir: string;
  let file: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "workspace-ids-"));
    file = join(dir, "linear-workspace.json");
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("round-trips a written file and resolves labels/states by key", async () => {
    const ids = {
      version: 1 as const,
      generatedAt: new Date().toISOString(),
      team: { id: "t1", key: "PAP", name: "PaperOS" },
      states: { "Ready for Claude": "state-1" },
      labels: { "Character/Atlas": "label-1" },
      templates: {},
      projects: {},
      cycles: {},
      teamSettings: { issueEstimationType: "fibonacci", cyclesEnabled: true, triageEnabled: true },
    };
    await writeFile(file, JSON.stringify(ids), "utf8");

    const loaded = await loadWorkspaceIds(file);
    expect(requireLabel(loaded, "Character/Atlas")).toBe("label-1");
    expect(requireState(loaded, "Ready for Claude")).toBe("state-1");
  });

  it("throws a clear error when the file is missing", async () => {
    await expect(loadWorkspaceIds(join(dir, "nope.json"))).rejects.toThrow(/not found/);
  });

  it("requireLabel/requireState throw a clear error for an unknown key", async () => {
    const ids = {
      version: 1 as const,
      generatedAt: new Date().toISOString(),
      team: { id: "t1", key: "PAP", name: "PaperOS" },
      states: {},
      labels: {},
      templates: {},
      projects: {},
      cycles: {},
      teamSettings: { issueEstimationType: "fibonacci", cyclesEnabled: true, triageEnabled: true },
    };
    await writeFile(file, JSON.stringify(ids), "utf8");
    const loaded = await loadWorkspaceIds(file);
    expect(() => requireLabel(loaded, "Character/Ghost")).toThrow(/missing/);
    expect(() => requireState(loaded, "Nowhere")).toThrow(/missing/);
  });
});

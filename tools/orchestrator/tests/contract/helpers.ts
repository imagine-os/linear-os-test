import { readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { ContractConfig } from "../../src/contract/config.js";
import type { ContractIssue } from "../../src/contract/types.js";

export const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

export interface Fixture {
  name: string;
  note?: string;
  expect: { ok: boolean; errors: string[]; warns?: string[] };
  config?: { mode?: ContractConfig["mode"]; now?: string };
  issue: ContractIssue;
}

export function loadFixtures(kind: "good" | "bad"): Fixture[] {
  const dir = resolve(root, "fixtures/contract", kind);
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => JSON.parse(readFileSync(resolve(dir, f), "utf8")) as Fixture);
}

export function fixtureConfig(f: Fixture): Partial<ContractConfig> {
  const cfg: Partial<ContractConfig> = {};
  if (f.config?.mode) cfg.mode = f.config.mode;
  if (f.config?.now) {
    const at = new Date(f.config.now);
    cfg.now = () => at;
  }
  return cfg;
}

/** A conforming issue to mutate in unit tests. */
export function goodIssue(overrides: Partial<ContractIssue> = {}): ContractIssue {
  const base = loadFixtures("good")[0];
  if (!base) throw new Error("no good fixtures");
  return { ...structuredClone(base.issue), ...overrides };
}

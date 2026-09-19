/**
 * Orchestrator configuration (PAP-281): `orchestrator.config.yaml` parsed and
 * validated with Zod. One schema, one set of defaults, one error message when
 * the file is wrong — no `process.env.X ?? fallback` scattered through the
 * modules.
 *
 * `mode` is the build-loop adaptation Justin's org policy forces (git only, no
 * PRs). It carries the same two values as PAP-93's `ContractMode` and is what
 * `transitions.toInReview()` and `filters.isOpenBlocker()` branch on, so the
 * loop and the validator cannot disagree about what "In Review" means.
 */

import { parse as parseYaml } from "yaml";
import { z } from "zod";

export const MODES = ["build-loop", "pr-flow"] as const;
export type Mode = (typeof MODES)[number];

export const RepoSchema = z.object({
  name: z.string().min(1),
  remote: z.string().min(1),
  defaultBranch: z.string().min(1).default("main"),
});

export const OrchestratorConfigSchema = z.object({
  mode: z.enum(MODES).default("build-loop"),
  team: z.string().min(1).default("PAP"),
  pollIntervalMs: z.number().int().positive().default(30_000),
  maxParallel: z.number().int().positive().default(4),
  claim: z
    .object({
      maxRetries: z.number().int().min(0).default(2),
      staleClaimMs: z.number().int().positive().default(3_600_000),
    })
    .default({ maxRetries: 2, staleClaimMs: 3_600_000 }),
  backoff: z
    .object({
      initialMs: z.number().int().positive().default(1_000),
      maxMs: z.number().int().positive().default(300_000),
      factor: z.number().min(1).default(2),
    })
    .default({ initialMs: 1_000, maxMs: 300_000, factor: 2 }),
  db: z
    .object({ path: z.string().min(1).default(".data/orchestrator.db") })
    .default({ path: ".data/orchestrator.db" }),
  http: z
    .object({
      host: z.string().min(1).default("127.0.0.1"),
      port: z.number().int().min(0).max(65_535).default(8787),
    })
    .default({ host: "127.0.0.1", port: 8787 }),
  launcher: z.enum(["dry-run", "claude-code"]).default("dry-run"),
  repos: z.array(RepoSchema).default([]),
  charactersPath: z.string().min(1).default("roster.json"),
  defaultCharacter: z.string().min(1).default("atlas"),
  /** Null until PAP-48 creates per-character bot users. */
  botUserId: z.string().min(1).nullable().default(null),
  workspaceIdsPath: z.string().min(1).default("linear-workspace.json"),
});

export type OrchestratorConfig = z.infer<typeof OrchestratorConfigSchema>;
export type Repo = z.infer<typeof RepoSchema>;

/** Parse an already-decoded object (a test fixture, or YAML someone else read). */
export function parseConfig(raw: unknown): OrchestratorConfig {
  const result = OrchestratorConfigSchema.safeParse(raw ?? {});
  if (!result.success) {
    const lines = result.error.issues.map((i) => `  ${i.path.join(".") || "(root)"}: ${i.message}`);
    throw new Error(`orchestrator config is invalid:\n${lines.join("\n")}`);
  }
  return result.data;
}

/** Parse a YAML document. An empty file is valid and yields all defaults. */
export function parseConfigYaml(yaml: string): OrchestratorConfig {
  let doc: unknown;
  try {
    doc = parseYaml(yaml);
  } catch (err) {
    throw new Error(`orchestrator config is not valid YAML: ${(err as Error).message}`);
  }
  return parseConfig(doc ?? {});
}

/**
 * Load `orchestrator.config.yaml` from disk. A missing file is not an error:
 * the defaults above are a working configuration (dry-run launcher, SQLite in
 * `.data/`), which is what `pnpm orchestrator:status` needs on a fresh clone.
 */
export async function loadConfig(path = "orchestrator.config.yaml"): Promise<OrchestratorConfig> {
  const fs = await import("node:fs/promises");
  let raw: string;
  try {
    raw = await fs.readFile(path, "utf8");
  } catch {
    return parseConfig({});
  }
  return parseConfigYaml(raw);
}

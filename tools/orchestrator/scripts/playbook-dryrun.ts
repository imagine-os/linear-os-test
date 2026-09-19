/**
 * PAP-92 worked example: an offline toy session that renders the three session
 * comments (started, progress, ended) for a toy issue and validates each footer
 * against src/agents/session-footer.schema.json with ajv. Writes nothing to
 * Linear.
 *
 *   pnpm playbook:dryrun                 # print three comments, exit 0 when all validate
 *   pnpm footer:validate [file.json]     # validate one footer (or the built-in fixtures); prints `ok` per footer
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Ajv2020, type ErrorObject } from "ajv/dist/2020.js";
import addFormatsModule from "ajv-formats";

// ajv-formats ships CJS with a default export; unwrap it under both ESM loaders.
const addFormats = ((addFormatsModule as unknown as { default?: unknown }).default ??
  addFormatsModule) as unknown as (ajv: Ajv2020) => Ajv2020;

import {
  PLAYBOOK_VERSION,
  parseFooter,
  type SessionFooter,
  sessionFooterSchema,
} from "../src/agents/session-footer.js";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

export function makeValidator() {
  // strictRequired is off because the if/then blocks require properties declared on the parent object.
  const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: false });
  addFormats(ajv);
  return ajv.compile(sessionFooterSchema);
}

export function renderTemplate(name: string, vars: Record<string, string>): string {
  const src = readFileSync(resolve(root, "templates", `${name}.md`), "utf8");
  const out = src.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = vars[key];
    if (value === undefined) throw new Error(`template ${name}: missing placeholder ${key}`);
    return value;
  });
  return out.trimEnd();
}

export interface ToySession {
  issue: string;
  slug: string;
  character: SessionFooter["character"];
  model: string;
  baseBranches?: string[];
  date: string;
}

/** Render the three comments of a toy session. Pure; no I/O beyond reading templates. */
export function toySession(t: ToySession): { started: string; progress: string; ended: string } {
  const branch = `feat/${t.issue}-${t.slug}`;
  const base = {
    playbookVersion: PLAYBOOK_VERSION,
    sessionId: `${t.date}-${t.issue}`,
    character: t.character,
    issue: t.issue,
    branch,
    model: t.model,
  } satisfies Partial<SessionFooter>;
  const started: SessionFooter = {
    ...base,
    status: "started",
    ...(t.baseBranches?.length ? { baseBranches: t.baseBranches } : {}),
  };
  const progress: SessionFooter = { ...base, status: "progress", costUsd: 0.42, turns: 9 };
  const commits = ["0123abc", "4567def"];
  const ended: SessionFooter = { ...base, status: "ended", costUsd: 1.1, turns: 21, commits };
  const repo = "https://github.com/imagine-os/paperos-orchestrator";
  return {
    started: renderTemplate("session-started", {
      repo,
      worktree: `/workspace/wt/${t.issue}`,
      branch,
      characterLine: `${cap(t.character)} (lead)`,
      model: t.model,
      baseBranchesLine: t.baseBranches?.length
        ? ` Base branches merged: ${t.baseBranches.join(", ")}.`
        : "",
      readList:
        "Blueprint, Contracts, project Contract, Roster and character sheet, Threat Model §4/§6, Execution Schedule, issue body, CLAUDE.md, last two comments",
      plan: "write the toy module, add its test, run pnpm check, push.",
      footer: JSON.stringify(started),
    }),
    progress: renderTemplate("session-progress", {
      elapsed: "25 min",
      done: "toy module and test written",
      next: "pnpm check, rebase, push",
      blockers: "none",
      justinAck: "",
      footer: JSON.stringify(progress),
    }),
    ended: renderTemplate("session-ended", {
      integration: `commits ${commits.join(", ")} on main of ${repo}`,
      paths: `src/toy/, tests/toy.test.ts, docs/changelog/unreleased/${t.issue}.md`,
      checks: "pnpm check (lint, typecheck, test, build) green",
      evidence: "docs/toy.md",
      deviations: "none",
      needsJustin: "none",
      costUsd: String(ended.costUsd),
      turns: String(ended.turns),
      footer: JSON.stringify(ended),
    }),
  };
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}

function main(argv: string[]) {
  const validate = makeValidator();
  if (argv[0] === "--validate") {
    const files = argv.slice(1);
    const footers: unknown[] = files.length
      ? files.map((f) => JSON.parse(readFileSync(resolve(process.cwd(), f), "utf8")) as unknown)
      : Object.values(toySession(TOY)).map(parseFooter);
    let bad = 0;
    footers.forEach((footer, i) => {
      if (validate(footer)) console.log(`ok ${files[i] ?? `fixture ${i + 1}`}`);
      else {
        bad++;
        console.log(
          `fail ${files[i] ?? `fixture ${i + 1}`}: ${validate.errors?.map((e: ErrorObject) => `${e.instancePath || "/"} ${e.message}`).join("; ")}`,
        );
      }
    });
    if (bad) process.exit(1);
    return;
  }
  const comments = toySession(TOY);
  let n = 0;
  for (const [name, body] of Object.entries(comments)) {
    console.log(`--- ${name} (toy issue ${TOY.issue}, not posted) ---\n${body}\n`);
    const footer = parseFooter(body);
    if (footer === undefined) fail(`${name}: no paperos-session footer parsed`);
    if (!validate(footer)) fail(`${name}: footer invalid: ${JSON.stringify(validate.errors)}`);
    n++;
  }
  if (n !== 3) fail(`expected 3 comments, got ${n}`);
  console.log("dry run ok: 3 comments rendered, 3 footers valid, nothing written to Linear");
}

export const TOY: ToySession = {
  issue: "PAP-9999",
  slug: "toy-module",
  character: "quill",
  model: "claude-fable-5-1",
  baseBranches: ["feat/PAP-13-scaffold"],
  date: "2026-09-19",
};

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2));
}

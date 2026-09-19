/**
 * PAP-92 test plan: ajv over at least 10 valid and 10 invalid footers (two
 * valid ones carry baseBranches, and the v2 schema fixtures cover
 * playbookVersion 1 and 2, case-insensitive character, the review/reviewed
 * verdict requirement, and the integrator/remediation statuses), the playbook
 * word count (1500-2500), every absolute-GitHub-URL link in the playbook
 * resolving to a real local path, and the dry run yielding three parseable
 * comments.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { makeValidator, TOY, toySession } from "../scripts/playbook-dryrun.js";
import { PLAYBOOK_VERSION, parseFooter, type SessionFooter } from "../src/agents/session-footer.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const playbookPath = resolve(root, "docs/pm/session-playbook.md");
const validate = makeValidator();

const base: SessionFooter = {
  playbookVersion: PLAYBOOK_VERSION,
  sessionId: "2026-09-19-PAP-92",
  character: "quill",
  issue: "PAP-92",
  status: "started",
  branch: "feat/PAP-92-session-playbook",
};

function omitBranch<T extends { branch?: unknown }>(f: T): Omit<T, "branch"> {
  const { branch: _b, ...rest } = f;
  return rest;
}

const handoff: NonNullable<SessionFooter["handoff"]> = {
  kind: "build-to-review",
  to: "sentinel",
  reason: "playbook ready for review",
  artifacts: [{ type: "branch", ref: "feat/PAP-92-session-playbook" }],
  nextSteps: ["review wording against PAP-96 and PAP-93"],
  openQuestions: [{ q: "keep promoted in the enum?", default: "yes" }],
  contextFiles: ["docs/pm/session-playbook.md"],
};

const valid: [string, unknown][] = [
  ["minimal started", base],
  [
    "started with baseBranches",
    { ...base, baseBranches: ["feat/PAP-13-scaffold"], model: "claude-fable-5-1" },
  ],
  [
    "started with two baseBranches",
    { ...base, baseBranches: ["feat/PAP-13-scaffold", "feat/PAP-91-workspace"] },
  ],
  ["progress with cost", { ...base, status: "progress", costUsd: 0.5, turns: 7 }],
  [
    "ended with pr",
    {
      ...base,
      status: "ended",
      pr: "https://github.com/imagine-os/paperos-orchestrator/pull/1",
      costUsd: 2,
      turns: 30,
    },
  ],
  [
    "ended build-loop with commits",
    { ...base, status: "ended", commits: ["0123abc", "89abcdef0123456789abcdef0123456789abcdef"] },
  ],
  ["ended duplicate-claim", { ...base, status: "ended", reason: "duplicate-claim" }],
  ["partial budget", { ...base, status: "partial", reason: "budget", costUsd: 60 }],
  ["contract-failed needs-spec", { ...base, status: "contract-failed", reason: "needs-spec" }],
  ["handoff", { ...base, status: "handoff", handoff }],
  [
    "promoted by orchestrator",
    { ...base, character: "orchestrator", status: "promoted", sessionId: "2026-09-19-PAP-92-2" },
  ],
  [
    "the build loop's review footer (playbookVersion 1, capitalised character, no branch)",
    {
      playbookVersion: 1,
      sessionId: "2026-09-18-PAP-13",
      character: "Sentinel",
      issue: "PAP-13",
      status: "review",
      verdict: "pass",
      model: "claude-opus-5",
    },
  ],
  ["reviewed with a failing verdict", omitBranch({ ...base, status: "reviewed", verdict: "fail" })],
  [
    "integrated by the merge-queue integrator",
    {
      character: "integrator",
      issue: "PAP-92",
      playbookVersion: PLAYBOOK_VERSION,
      sessionId: "2026-09-19-PAP-92-3",
      status: "integrated",
      commits: ["0123abc"],
    },
  ],
  [
    "remediation by scribe (housekeeping pass, playbookVersion 2)",
    omitBranch({ ...base, character: "scribe", status: "remediation" }),
  ],
];

const invalid: [string, unknown][] = [
  ["unsupported playbookVersion", { ...base, playbookVersion: 3 }],
  ["missing branch on started", omitBranch(base)],
  ["unknown status", { ...base, status: "done" }],
  ["unknown character", { ...base, character: "gandalf" }],
  ["bad issue identifier", { ...base, issue: "ENG-92" }],
  ["bad sessionId", { ...base, sessionId: "PAP-92" }],
  ["empty baseBranches (must be omitted)", { ...base, baseBranches: [] }],
  ["baseBranches with a space", { ...base, baseBranches: ["feat/PAP 13"] }],
  ["handoff status without handoff", { ...base, status: "handoff" }],
  ["partial without reason", { ...base, status: "partial" }],
  ["extra property", { ...base, foo: 1 }],
  ["negative cost", { ...base, costUsd: -1 }],
  [
    "handoff open question without default",
    { ...base, status: "handoff", handoff: { ...handoff, openQuestions: [{ q: "?" }] } },
  ],
  ["review without verdict", omitBranch({ ...base, status: "review" })],
  ["reviewed without verdict", omitBranch({ ...base, status: "reviewed" })],
  ["unknown verdict value", omitBranch({ ...base, status: "review", verdict: "maybe" })],
];

describe("session footer schema", () => {
  it("has at least 10 valid and 10 invalid fixtures, two valid with baseBranches", () => {
    expect(valid.length).toBeGreaterThanOrEqual(10);
    expect(invalid.length).toBeGreaterThanOrEqual(10);
    const withBase = valid.filter(([, f]) => Array.isArray((f as SessionFooter).baseBranches));
    expect(withBase.length).toBeGreaterThanOrEqual(2);
  });
  for (const [name, footer] of valid) {
    it(`accepts ${name}`, () => {
      expect(validate(footer), JSON.stringify(validate.errors)).toBe(true);
    });
  }
  for (const [name, footer] of invalid) {
    it(`rejects ${name}`, () => {
      expect(validate(footer)).toBe(false);
    });
  }
});

describe("playbook document", () => {
  const md = readFileSync(playbookPath, "utf8");

  it("is 1500-2500 words (mermaid excluded, link URLs stripped, punctuation-only tokens ignored)", () => {
    const text = md.replace(/```mermaid[\s\S]*?```/g, "").replace(/\]\([^)]*\)/g, "]");
    const words = text.split(/\s+/).filter((t) => /[A-Za-z0-9]/.test(t));
    expect(words.length).toBeGreaterThanOrEqual(1500);
    expect(words.length).toBeLessThanOrEqual(2500);
  });

  it("resolves every in-repo link (absolute GitHub blob URL, so the byte-identical template mirror resolves too)", () => {
    const repoBase = "https://github.com/imagine-os/empty12/blob/main/";
    const links = [...md.matchAll(/\]\(([^)#\s]+)(#[^)]*)?\)/g)].map((m) => m[1] ?? "");
    const githubFileLinks = links.filter((l) => l.startsWith(repoBase));
    expect(githubFileLinks.length).toBeGreaterThan(0);
    for (const l of githubFileLinks) {
      const localPath = l.slice(repoBase.length);
      expect(existsSync(resolve(root, localPath)), `broken link ${l}`).toBe(true);
    }
    // No bare relative link should remain: every in-repo reference is now an absolute GitHub URL,
    // so it resolves the same way from docs/pm/ here and from .claude/rules/ in the template mirror.
    const relative = links.filter((l) => l !== "" && !/^[a-z]+:/i.test(l));
    expect(relative).toEqual([]);
  });

  it("carries the umbrella, promotion and deferred rules and the build-loop section", () => {
    expect(md).toContain(
      "An issue with sub-issues is an umbrella. It is never moved to Ready for Claude and never claimed",
    );
    expect(md).toContain("`UMBRELLA_NOT_CLAIMABLE`");
    expect(md).toContain("Nobody hand-picks issues for you.");
    expect(md).toContain(
      "`BLOCKED_BY_OPEN` = an inbound blocker in Backlog, Todo, Ready for Claude, In Progress or Needs Justin, or In Review without a PR",
    );
    expect(md).toContain("never claimed and never promoted until Justin removes the deferral");
    expect(md).toContain("## 8. Build-loop mode (2026-09-19");
    expect(md).toContain("```mermaid");
  });

  it("links every document of the Blueprint reading order", () => {
    for (const slug of [
      "paperos-core-platform-blueprint-0c2115fe48f1",
      "paperos-interface-and-data-contracts-d40e6a4d227c",
      "paperos-agent-roster-org-chart-and-character-index-fc7ea7f41ff3",
      "paperos-security-and-threat-model-51fd5fd8929c",
      "paperos-execution-schedule-1fa3d38d6795",
      "new-app-in-ten-minutes-the-golden-path-0f49429f566e",
      "character-sheet-atlas-",
      "character-sheet-forge-",
      "character-sheet-iris-",
      "character-sheet-quill-",
      "character-sheet-sentinel-",
      "character-sheet-nova-",
      "character-sheet-ledger-",
      "character-sheet-beacon-",
      "character-sheet-scout-",
      "round-2-pending-issues-pm-linear-9-",
    ]) {
      expect(md, `missing link ${slug}`).toContain(`https://linear.app/paperos/document/${slug}`);
    }
  });
});

describe("dry run", () => {
  it("renders three comments whose footers parse and validate", () => {
    const comments = toySession(TOY);
    const names = Object.keys(comments);
    expect(names).toEqual(["started", "progress", "ended"]);
    for (const body of Object.values(comments)) {
      const footer = parseFooter(body);
      expect(footer).toBeDefined();
      expect(validate(footer), JSON.stringify(validate.errors)).toBe(true);
    }
    expect((parseFooter(comments.started) as SessionFooter).baseBranches).toEqual(TOY.baseBranches);
  });
});

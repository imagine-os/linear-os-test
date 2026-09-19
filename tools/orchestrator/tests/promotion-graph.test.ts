/**
 * The promotion fixture graph from PAP-96's Test plan, run through the
 * predicates PAP-281 owns.
 *
 * Scope note: PAP-691 is a separate child of PAP-96, so `promote()` itself,
 * the `promotions` writes and `pnpm linear:promote` are built there, not
 * here. What PAP-281 owns is the shared vocabulary those checks are made of —
 * `isDeferred` (check 1), `isUmbrella` (check 2) and `isOpenBlocker` /
 * `blockersOf` / `baseBranchesFor` (check 3, the branch-start rule) — plus
 * the fixture itself, so PAP-691 inherits both the graph and a proof that
 * checks 1-3 already give the spec's expected verdicts.
 *
 * Check 4 (`validateIssue`, PAP-93) is the one thing these predicates cannot
 * decide, and `PAP-i` in the fixture is exactly the issue that only check 4
 * catches. The last test asserts that: with the validator unavailable,
 * checks 1-3 let `PAP-i` through, which is precisely why the report is marked
 * `validator: "unavailable"` until PAP-93 is on main. When it is, the same
 * test imports its `isOpen` and asserts the two predicates agree on every
 * blocker in the graph — the `promotion.validator_mismatch` guard, enforced
 * at build time rather than logged at run time.
 */

import { describe, expect, it } from "vitest";
import type { Mode } from "../src/config.js";
import {
  baseBranchesFor,
  blockersOf,
  isDeferred,
  isOpenBlocker,
  isUmbrella,
} from "../src/linear/filters.js";
import type { IssueNode } from "../src/linear/issues.js";
import { loadValidator, resetValidatorCache } from "../src/validator.js";
import graph from "./fixtures/promotion-graph.json" with { type: "json" };

const issues = graph.issues as unknown as IssueNode[];
const byId = (identifier: string): IssueNode => {
  const found = issues.find((i) => i.identifier === identifier);
  if (!found) throw new Error(`fixture has no ${identifier}`);
  return found;
};

/** PAP-96 promotion checks 1-3. Check 4 is PAP-93's and is not decided here. */
function passesChecks1to3(issue: IssueNode, mode: Mode): boolean {
  if (issue.state.name !== "Backlog") return false;
  if (isDeferred(issue)) return false;
  if (isUmbrella(issue)) return false;
  return blockersOf(issue).every((b) => !isOpenBlocker(b, mode));
}

/**
 * The stand-in for check 4 while PAP-93 is not on main: the local
 * `parseSections` fallback PAP-96 names ("checks 1-3 plus a local
 * parseSections requiring the eight PAP-93 sections, report marked
 * `validator: unavailable`"). It lives in the test, not in `src/`, because
 * the real check belongs to PAP-93 and the pass that calls it to PAP-691.
 */
const REQUIRED_SECTIONS = [
  "Goal",
  "Scope",
  "Spec",
  "Definition of done",
  "Edge cases",
  "Dependencies",
  "Agent",
  "Size",
];

function hasRequiredSections(issue: IssueNode): boolean {
  const description = issue.description ?? "";
  return REQUIRED_SECTIONS.every((section) =>
    new RegExp(`^\\s*\\*{0,2}${section}\\*{0,2}\\s*$`, "im").test(description),
  );
}

/** All four checks, with check 4 served by the local fallback. */
function promotable(issue: IssueNode, mode: Mode): boolean {
  return passesChecks1to3(issue, mode) && hasRequiredSections(issue);
}

describe("promotion fixture graph (PAP-96 Test plan)", () => {
  it("promotes exactly PAP-b and PAP-d in pr-flow mode", () => {
    const candidates = issues.filter((i) => promotable(i, "pr-flow")).map((i) => i.identifier);
    expect(candidates).toEqual(graph.expectPromoted);
  });

  it("checks 1-3 alone let PAP-i through; only check 4 catches it", () => {
    const byChecks123 = issues
      .filter((i) => passesChecks1to3(i, "pr-flow"))
      .map((i) => i.identifier);
    expect(byChecks123).toEqual(["PAP-b", "PAP-d", "PAP-i"]);
    expect(hasRequiredSections(byId("PAP-i"))).toBe(false);
  });

  it("leaves each excluded issue out for its own reason", () => {
    expect(isDeferred(byId("PAP-e"))).toBe(true);
    expect(isUmbrella(byId("PAP-f"))).toBe(true);
    expect(blockersOf(byId("PAP-g")).map((b) => isOpenBlocker(b, "pr-flow"))).toEqual([true]);
    expect(blockersOf(byId("PAP-h")).map((b) => isOpenBlocker(b, "pr-flow"))).toEqual([true]);
  });

  it("collects BASE_BRANCHES from In Review blockers only, in identifier order", () => {
    expect(baseBranchesFor(byId("PAP-b"))).toEqual(graph.expectBaseBranches["PAP-b"]);
    expect(baseBranchesFor(byId("PAP-d"))).toEqual(graph.expectBaseBranches["PAP-d"]);
  });

  it("is idempotent: the same pass over the same graph gives the same verdicts", () => {
    const once = issues.filter((i) => promotable(i, "pr-flow")).map((i) => i.identifier);
    const twice = issues.filter((i) => promotable(i, "pr-flow")).map((i) => i.identifier);
    expect(twice).toEqual(once);
  });

  it("re-blocks PAP-d when PAP-c goes back to In Progress", () => {
    const d = structuredClone(byId("PAP-d"));
    const blocker = d.inverseRelations?.nodes[0];
    if (!blocker) throw new Error("fixture lost PAP-d's blocker");
    blocker.issue.state = { id: "s-progress", name: "In Progress", type: "started" };
    expect(promotable(d, "pr-flow")).toBe(false);
  });

  it("build-loop mode also clears PAP-h, because In Review means pushed to main", () => {
    // The documented adaptation: with no PRs, an In Review blocker is closed
    // without a PR check (playbook §8, PAP-93 `isOpen` mode option).
    expect(passesChecks1to3(byId("PAP-h"), "pr-flow")).toBe(false);
    expect(passesChecks1to3(byId("PAP-h"), "build-loop")).toBe(true);
  });

  it("an umbrella's children are judged on their own blockers, the umbrella never", () => {
    const child: IssueNode = {
      ...structuredClone(byId("PAP-b")),
      id: "u-f1",
      identifier: "PAP-f1",
      parent: { id: "u-f", identifier: "PAP-f" },
    };
    expect(promotable(child, "pr-flow")).toBe(true);
    expect(promotable(byId("PAP-f"), "pr-flow")).toBe(false);
  });

  it("check 4 is the validator's: PAP-i needs it, and agrees with isOpen when present", async () => {
    // Checks 1-3 alone let PAP-i through — it has no blockers, no Deferred
    // label and no children. Only `validateIssue` sees the missing
    // "Definition of done".
    expect(passesChecks1to3(byId("PAP-i"), "pr-flow")).toBe(true);
    expect(byId("PAP-i").description ?? "").not.toContain("Definition of done");

    resetValidatorCache();
    const validator = await loadValidator("../src/contract/index.js");
    if (!validator) {
      // PAP-93 is not on main yet: the report is marked `validator:
      // "unavailable"` and PAP-i stays in Backlog by the local section check
      // PAP-691 applies in the meantime.
      expect(validator).toBeNull();
      return;
    }
    for (const issue of issues) {
      for (const blocker of blockersOf(issue)) {
        const theirs = validator.isOpen(
          {
            identifier: blocker.identifier,
            state: { name: blocker.state.name },
            branch: blocker.branchName ?? undefined,
            pr: (blocker.attachments?.nodes ?? []).some((a) => a.url.includes("/pull/"))
              ? { open: true }
              : undefined,
          },
          { mode: "pr-flow" },
        );
        expect(isOpenBlocker(blocker, "pr-flow")).toBe(theirs);
      }
    }
  });
});

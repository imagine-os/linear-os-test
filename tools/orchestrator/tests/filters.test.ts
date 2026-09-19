/** The claim/promotion predicates (PAP-281), unit by unit. */

import { describe, expect, it } from "vitest";
import {
  baseBranchesFor,
  blockersOf,
  characterOf,
  claimBlockedBy,
  hasOpenPr,
  isDeferred,
  isOpenBlocker,
  isUmbrella,
  orderQueue,
  pickNext,
} from "../src/linear/filters.js";
import type { RelatedIssueNode } from "../src/linear/issues.js";
import { makeIssue } from "./helpers/mock-linear.js";

const blocker = (name: string, patch: Partial<RelatedIssueNode> = {}): RelatedIssueNode => ({
  id: `b-${name}`,
  identifier: `PAP-${name}`,
  state: { id: `s-${name}`, name, type: "started" },
  branchName: `feat/PAP-${name}`,
  attachments: { nodes: [] },
  ...patch,
});

describe("isDeferred", () => {
  it("catches the label", () => {
    expect(isDeferred(makeIssue({ labels: { nodes: [{ name: "Deferred" }] } }))).toBe(true);
  });

  it("catches a deferral note under Goal", () => {
    const issue = {
      ...makeIssue(),
      description: "**Goal**\n\nThis is deferred to v0.2 until Justin says otherwise.\n",
    };
    expect(isDeferred(issue)).toBe(true);
  });

  it("does not fire on the word appearing far from Goal", () => {
    const issue = {
      ...makeIssue(),
      description: `**Goal**\n\nShip it.\n\n${"filler. ".repeat(200)}\n\n**Edge cases**\n\nA deferred blocker.`,
    };
    expect(isDeferred(issue)).toBe(false);
  });

  it("is false for an ordinary issue", () => {
    expect(isDeferred(makeIssue())).toBe(false);
  });

  it("catches the plan's deferral statements (sentence starting with Deferred)", () => {
    for (const goal of [
      "Deferred to v0.2 by the Execution Schedule (NJ-14 stop-loss 09-27 can reinstate). Not claimable before 10-01.",
      "Deferred to v0.2 (past 2026-10-01): the brief names partners.",
      "PAP-621 (hard). Deferred; nothing waits on it.",
      "Ship the thing.\n\nDeferred to v0.2 by round 4 (not claimable before 2026-10-01).",
    ]) {
      expect(
        isDeferred({ ...makeIssue(), description: `**Goal**\n\n${goal}\n\n**Scope**\n\nx` }),
      ).toBe(true);
    }
  });

  it("does not fire when Goal merely mentions the word (live false positives PAP-695, PAP-701)", () => {
    for (const goal of [
      "Initiatives are the Linear layer where eighteen projects become five lines with progress bars: the Oct 1 release, the deferred v0.2 set, and the brief's themes.",
      "The pipeline's real questions (what is Ready and tightest on slack, what is deferred) have no saved answer.",
      "Revenue recognition schedules: deferred revenue for prepaid periods.",
    ]) {
      expect(
        isDeferred({ ...makeIssue(), description: `**Goal**\n\n${goal}\n\n**Scope**\n\nx` }),
      ).toBe(false);
    }
  });

  it("ignores a deferral statement outside the Goal section", () => {
    const issue = {
      ...makeIssue(),
      description:
        "**Goal**\n\nShip it.\n\n**Dependencies**\n\nPAP-1 (hard). Deferred; nothing waits on it.",
    };
    expect(isDeferred(issue)).toBe(false);
  });
});

describe("isUmbrella", () => {
  it("is true as soon as there is one child", () => {
    expect(isUmbrella(makeIssue({ children: { nodes: [{ id: "c", identifier: "PAP-c" }] } }))).toBe(
      true,
    );
    expect(isUmbrella(makeIssue())).toBe(false);
  });
});

describe("isOpenBlocker", () => {
  it("closes on Done, Canceled and Duplicate", () => {
    for (const name of ["Done", "Canceled", "Duplicate"]) {
      expect(isOpenBlocker(blocker(name), "pr-flow")).toBe(false);
    }
  });

  it("stays open on Backlog, Todo, Ready for Claude, In Progress and Needs Justin", () => {
    for (const name of ["Backlog", "Todo", "Ready for Claude", "In Progress", "Needs Justin"]) {
      expect(isOpenBlocker(blocker(name), "pr-flow")).toBe(true);
    }
  });

  it("In Review needs a PR in pr-flow, and nothing in build-loop", () => {
    const noPr = blocker("In Review");
    const withPr = blocker("In Review", {
      attachments: { nodes: [{ url: "https://github.com/o/r/pull/1" }] },
    });
    expect(isOpenBlocker(noPr, "pr-flow")).toBe(true);
    expect(isOpenBlocker(withPr, "pr-flow")).toBe(false);
    expect(isOpenBlocker(noPr, "build-loop")).toBe(false);
  });

  it("treats an unknown state as still blocking", () => {
    expect(isOpenBlocker(blocker("Triage"), "pr-flow")).toBe(true);
    expect(isOpenBlocker(blocker("Some New State"), "build-loop")).toBe(true);
  });

  it("recognises a PR attachment but not an arbitrary link", () => {
    expect(
      hasOpenPr(blocker("In Review", { attachments: { nodes: [{ url: "https://x/doc" }] } })),
    ).toBe(false);
    expect(
      hasOpenPr(blocker("In Review", { attachments: { nodes: [{ url: "https://x/pull/9" }] } })),
    ).toBe(true);
  });
});

describe("blockersOf and baseBranchesFor", () => {
  const issue = makeIssue({
    inverseRelations: {
      nodes: [
        {
          type: "blocks",
          issue: blocker("In Review", {
            identifier: "PAP-20",
            branchName: "feat/PAP-20",
            attachments: { nodes: [{ url: "https://x/pull/1" }] },
          }),
        },
        {
          type: "blocks",
          issue: blocker("In Review", {
            identifier: "PAP-3",
            branchName: "feat/PAP-3",
            attachments: { nodes: [{ url: "https://x/pull/2" }] },
          }),
        },
        { type: "related", issue: blocker("Backlog", { identifier: "PAP-99" }) },
      ],
    },
  });

  it("keeps only blocks relations, in numeric identifier order", () => {
    expect(blockersOf(issue).map((b) => b.identifier)).toEqual(["PAP-3", "PAP-20"]);
  });

  it("collects base branches from In Review blockers with a PR", () => {
    expect(baseBranchesFor(issue)).toEqual(["feat/PAP-3", "feat/PAP-20"]);
  });
});

describe("claimBlockedBy", () => {
  it("names the first rule that refuses", () => {
    expect(claimBlockedBy(makeIssue())).toBeUndefined();
    expect(
      claimBlockedBy(makeIssue({ state: { id: "s", name: "Backlog", type: "backlog" } })),
    ).toBe("wrong-state");
    expect(claimBlockedBy(makeIssue({ assignee: { id: "u", name: "Justin" } }))).toBe("assigned");
    expect(claimBlockedBy(makeIssue({ labels: { nodes: [{ name: "Deferred" }] } }))).toBe(
      "deferred",
    );
    expect(claimBlockedBy(makeIssue({ children: { nodes: [{ id: "c", identifier: "x" }] } }))).toBe(
      "umbrella",
    );
  });
});

describe("pickNext", () => {
  it("returns undefined on an empty queue", () => {
    expect(pickNext([])).toBeUndefined();
    expect(orderQueue([])).toEqual([]);
  });

  it("breaks a full tie by identifier, so two replicas agree", () => {
    const a = makeIssue({ identifier: "PAP-10", priority: 2, createdAt: "2026-09-01T00:00:00Z" });
    const b = makeIssue({ identifier: "PAP-2", priority: 2, createdAt: "2026-09-01T00:00:00Z" });
    expect(orderQueue([a, b]).map((i) => i.identifier)).toEqual(["PAP-2", "PAP-10"]);
  });
});

describe("characterOf", () => {
  it("reads the grouped label and lowercases it", () => {
    expect(
      characterOf(
        makeIssue({ labels: { nodes: [{ name: "Atlas", parent: { name: "Character" } }] } }),
      ),
    ).toBe("atlas");
    expect(characterOf(makeIssue({ labels: { nodes: [{ name: "Character/Sentinel" }] } }))).toBe(
      "sentinel",
    );
    expect(characterOf(makeIssue())).toBeUndefined();
  });
});

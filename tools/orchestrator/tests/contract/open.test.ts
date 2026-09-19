import { describe, expect, it } from "vitest";
import { CLOSED_STATES, describeBlocker, isOpen, OPEN_STATES } from "../../src/contract/open.js";
import type { Blocker } from "../../src/contract/types.js";

const b = (state: string, extra: Partial<Blocker> = {}): Blocker => ({
  identifier: "PAP-1",
  state: { name: state },
  ...extra,
});

describe("isOpen", () => {
  it("is open in Backlog, Todo, Ready for Claude, In Progress, Needs Justin in both modes", () => {
    for (const s of OPEN_STATES) {
      expect(isOpen(b(s), { mode: "pr-flow" })).toBe(true);
      expect(isOpen(b(s), { mode: "build-loop" })).toBe(true);
    }
  });

  it("is closed in Done, Canceled, Duplicate in both modes", () => {
    for (const s of CLOSED_STATES) {
      expect(isOpen(b(s), { mode: "pr-flow" })).toBe(false);
      expect(isOpen(b(s))).toBe(false);
    }
  });

  it("pr-flow: In Review is closed only with an open PR (branch-start rule)", () => {
    expect(isOpen(b("In Review"), { mode: "pr-flow" })).toBe(true);
    expect(isOpen(b("In Review", { pr: { open: false, url: "x" } }), { mode: "pr-flow" })).toBe(
      true,
    );
    expect(isOpen(b("In Review", { pr: { open: true, url: "x" } }), { mode: "pr-flow" })).toBe(
      false,
    );
  });

  it("build-loop (default): In Review is closed without a PR check", () => {
    expect(isOpen(b("In Review"))).toBe(false);
    expect(isOpen(b("In Review"), { mode: "build-loop" })).toBe(false);
  });

  it("unknown or intake states stay open (conservative)", () => {
    expect(isOpen(b("Triage"))).toBe(true);
    expect(isOpen(b("Someday"))).toBe(true);
  });
});

describe("describeBlocker", () => {
  it("names state and PR/branch status per mode", () => {
    expect(describeBlocker(b("Done"))).toBe("PAP-1 (Done)");
    expect(describeBlocker(b("In Review"))).toBe("PAP-1 (In Review, build-loop: on main)");
    expect(
      describeBlocker(b("In Review", { pr: { open: true, url: "u" } }), { mode: "pr-flow" }),
    ).toBe("PAP-1 (In Review, PR u)");
    expect(describeBlocker(b("In Review", { pr: { open: true } }), { mode: "pr-flow" })).toBe(
      "PAP-1 (In Review, PR open)",
    );
    expect(describeBlocker(b("In Review", { branch: "feat/x" }), { mode: "pr-flow" })).toBe(
      "PAP-1 (In Review, no PR, branch feat/x)",
    );
    expect(describeBlocker(b("In Review"), { mode: "pr-flow" })).toBe("PAP-1 (In Review, no PR)");
  });
});

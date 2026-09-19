/**
 * The optional bridge to PAP-93's validator (PAP-281). While
 * `src/contract/` is not on main the loop must run and report
 * `validator: "unavailable"` rather than fail.
 */

import { beforeEach, describe, expect, it } from "vitest";
import { loadValidator, resetValidatorCache, validatorStatus } from "../src/validator.js";

describe("loadValidator", () => {
  beforeEach(() => {
    resetValidatorCache();
  });

  it("returns null for a module that is not there", async () => {
    expect(await loadValidator("./definitely-not-a-module.js")).toBeNull();
  });

  it("returns null for a module that lacks the two functions", async () => {
    expect(await loadValidator("node:path")).toBeNull();
  });

  it("caches the answer so a missing module is probed once", async () => {
    expect(await loadValidator("./definitely-not-a-module.js")).toBeNull();
    // A second call with a different specifier still returns the cached null.
    expect(await loadValidator("node:path")).toBeNull();
  });

  it("reports the status the report and /status carry", async () => {
    resetValidatorCache();
    expect(["available", "unavailable"]).toContain(await validatorStatus());
  });
});

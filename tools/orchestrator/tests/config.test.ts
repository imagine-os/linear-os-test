/** `orchestrator.config.yaml` and its Zod schema (PAP-281). */

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { loadConfig, parseConfig, parseConfigYaml } from "../src/config.js";

describe("orchestrator config", () => {
  it("has working defaults when nothing is given", () => {
    const config = parseConfig({});
    expect(config.mode).toBe("build-loop");
    expect(config.pollIntervalMs).toBe(30_000);
    expect(config.maxParallel).toBe(4);
    expect(config.claim.maxRetries).toBe(2);
    expect(config.launcher).toBe("dry-run");
    expect(config.botUserId).toBeNull();
  });

  it("parses the committed orchestrator.config.yaml", () => {
    const config = parseConfigYaml(readFileSync("orchestrator.config.yaml", "utf8"));
    expect(config.mode).toBe("build-loop");
    expect(config.team).toBe("PAP");
    expect(config.repos.map((r) => r.name)).toContain("paperos-orchestrator");
    expect(config.launcher).toBe("dry-run");
  });

  it("names the offending field when the config is wrong", () => {
    expect(() => parseConfig({ pollIntervalMs: -1 })).toThrow(/pollIntervalMs/);
    expect(() => parseConfig({ mode: "yolo" })).toThrow(/mode/);
    expect(() => parseConfig({ maxParallel: 0 })).toThrow(/maxParallel/);
  });

  it("rejects YAML that is not a document", () => {
    expect(() => parseConfigYaml("mode: [unclosed")).toThrow(/YAML/);
  });

  it("falls back to defaults when the file does not exist", async () => {
    const config = await loadConfig("does-not-exist.yaml");
    expect(config.mode).toBe("build-loop");
  });
});

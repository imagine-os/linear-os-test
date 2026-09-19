import { describe, expect, it } from "vitest";
import {
  CONTRACT_CHECKS_DDL,
  type ContractCheckStore,
  MemoryContractCheckStore,
  openSqliteContractCheckStore,
} from "../../src/contract/store.js";
import type { ContractResult } from "../../src/contract/types.js";

const failing: ContractResult = {
  ok: false,
  violations: [{ code: "MISSING_SECTION", severity: "error", message: "m", fix: "f" }],
};
const passing: ContractResult = { ok: true, violations: [] };

function suite(name: string, open: () => Promise<ContractCheckStore>) {
  describe(name, () => {
    it("records checks per issue in order and returns the latest", async () => {
      const store = await open();
      const t1 = new Date("2026-09-19T01:00:00Z");
      const t2 = new Date("2026-09-19T02:00:00Z");
      store.record("i1", failing, t1);
      store.record("i1", passing, t2);
      store.record("i2", failing, t1);
      expect(store.history("i1").map((r) => r.ok)).toEqual([false, true]);
      expect(store.latest("i1")).toMatchObject({
        issueId: "i1",
        ok: true,
        checkedAt: t2.toISOString(),
        violations: [],
      });
      expect(store.latest("i2")?.violations[0]?.code).toBe("MISSING_SECTION");
      expect(store.latest("nope")).toBeUndefined();
      expect(store.record("i3", passing).checkedAt).toMatch(/^\d{4}-/);
      store.close();
    });

    it("firstDelivery is true once per webhookId", async () => {
      const store = await open();
      expect(store.firstDelivery("w1")).toBe(true);
      expect(store.firstDelivery("w1")).toBe(false);
      expect(store.firstDelivery("w2", new Date())).toBe(true);
      store.close();
    });
  });
}

suite("MemoryContractCheckStore", async () => new MemoryContractCheckStore());
suite("SqliteContractCheckStore (node:sqlite, :memory:)", () =>
  openSqliteContractCheckStore(":memory:"));

describe("DDL", () => {
  it("defines contract_checks(issue_id, checked_at, ok, violations_json) and webhook_deliveries", () => {
    expect(CONTRACT_CHECKS_DDL).toMatch(/CREATE TABLE IF NOT EXISTS contract_checks/);
    for (const col of ["issue_id", "checked_at", "ok", "violations_json"])
      expect(CONTRACT_CHECKS_DDL).toContain(col);
    expect(CONTRACT_CHECKS_DDL).toMatch(/webhook_deliveries/);
  });
});

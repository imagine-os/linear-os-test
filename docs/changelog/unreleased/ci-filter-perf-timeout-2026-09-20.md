### Fixed — CI filter perf test 2026-09-20: scaling test bounded in runtime and timeout

- `toSql` "scales roughly linearly from 5 to 50 conditions" flaked twice on shared runners (CI runs
  35468108762 and 35538501217) by exceeding Vitest's 5 s default timeout while its 40x assertion
  passed (3.8x). The test now warms each tree up once instead of once per round, runs 3 interleaved
  rounds instead of 4 with batches of 30/3 calls instead of 50/5 (same 10:1 equal-wall-time
  pairing), and both perf tests carry an explicit 30 s timeout. Measured locally under coverage:
  scaling test 1029 ms -> ~400 ms, whole file ~0.7 s, ratio still ~9.5x. Intent unchanged.
- Paths: `packages/core/src/filter/filter.perf.test.ts`.

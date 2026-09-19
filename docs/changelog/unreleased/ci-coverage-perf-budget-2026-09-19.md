### Fixed — CI 2026-09-19: filter perf budget robust under coverage instrumentation

- The `Coverage` CI step failed on `filter.perf.test.ts` (`expected 1.5965 to be less than 1`): the
  1 ms wall-clock budget held on bare V8 but not under V8 coverage on a shared runner. The test now
  times batched calls (median of 20 × 10 after warm-up), asserts a 10 ms budget, and adds a relative
  check that 50 conditions compile in under 40× the time of 5 (linear is ~10×, quadratic ~100×), so a
  real regression still fails while runner speed cancels out.
- Paths: `packages/core/src/filter/filter.perf.test.ts`, `docs/platform/filter.md`.

import { describe, expect, it } from 'vitest';
import { and, defineFields, type FilterTree, or, toSql } from './index.js';

const fields = defineFields({
  name: { type: 'string' },
  email: { type: 'string', caseInsensitive: true },
  amount: { type: 'number' },
  status: { type: 'enum', values: ['open', 'closed', 'paused'] },
  due: { type: 'date' },
  tags: { type: 'array', items: 'string' },
  meta: { type: 'json' },
});

/** `groups` × 5 conditions; 10 groups is the spec's 50-condition perf fixture. */
function fixture(groups: number): FilterTree {
  const out: FilterTree[] = [];
  for (let g = 0; g < groups; g += 1) {
    out.push(
      or(
        { field: 'name', operator: 'contains', value: `ada${g}` },
        { field: 'email', operator: 'eq', value: `user${g}@example.com` },
        { field: 'amount', operator: 'between', value: [g, g + 10] },
        { field: 'status', operator: 'in', value: ['open', 'paused'] },
        { field: 'meta', operator: 'matches', value: { path: ['a', String(g)], equals: g } },
      ),
    );
  }
  return and(...out);
}

const ctx = { fields };
const WARMUP = 100;
const SAMPLES = 20;

interface Timing {
  /** Median per-call ms: the typical cost, what a request would see. */
  median: number;
  /** Fastest per-call ms: the intrinsic cost; scheduler noise can only add to it. */
  min: number;
}

/**
 * Times `SAMPLES` batches of `batch` calls each and reports per-call ms. Batching keeps every
 * sample well above `performance.now()` granularity; taking 20 samples after warm-up lets the
 * statistics discard JIT tiers and scheduler hiccups on shared CI runners.
 */
function time(tree: FilterTree, batch: number): Timing {
  for (let i = 0; i < WARMUP; i += 1) toSql(tree, 'things', ctx);
  const samples: number[] = [];
  for (let s = 0; s < SAMPLES; s += 1) {
    const start = performance.now();
    for (let i = 0; i < batch; i += 1) toSql(tree, 'things', ctx);
    samples.push((performance.now() - start) / batch);
  }
  const sorted = [...samples].sort((a, b) => a - b);
  return { median: sorted[Math.floor(sorted.length / 2)] as number, min: sorted[0] as number };
}

/**
 * Absolute budget. Bare V8 compiles the 50-condition tree in ~0.2 ms; under V8 coverage
 * instrumentation on a shared GitHub runner it has been measured at 1.6 ms, and at 1.7 ms with
 * every workspace package's tests running in parallel. 10 ms keeps a wide margin for slow runners
 * while still failing on an order-of-magnitude regression.
 */
const BUDGET_MS = 10;

/**
 * Relative bound: 50 conditions versus 5. Linear compilation gives ~10×; a quadratic regression
 * (for example re-walking the tree per condition) gives ~100×. The two trees are timed in
 * alternating batches of equal wall time (50 calls of the small tree per 5 of the large), so runner
 * speed, instrumentation and CPU contention hit both alike, and the fastest sample of each is
 * compared because contention can only slow a sample down, never speed it up.
 */
const MAX_SCALING = 40;

describe('toSql performance', () => {
  it('compiles a 50-condition tree within a 10 ms budget (median of 20 batched runs after warm-up)', () => {
    const { median, min } = time(fixture(10), 10);
    // eslint-disable-next-line no-console
    console.info(
      `toSql 50 conditions: median ${median.toFixed(3)} ms, min ${min.toFixed(3)} ms per call`,
    );
    expect(median).toBeLessThan(BUDGET_MS);
  });

  it('scales roughly linearly from 5 to 50 conditions (under 40× for 10× the conditions)', () => {
    const small = fixture(1);
    const large = fixture(10);
    let smallMin = Number.POSITIVE_INFINITY;
    let largeMin = Number.POSITIVE_INFINITY;
    // Interleave so both trees see the same machine state; equalise wall time per batch.
    for (let round = 0; round < 4; round += 1) {
      smallMin = Math.min(smallMin, time(small, 50).min);
      largeMin = Math.min(largeMin, time(large, 5).min);
    }
    const ratio = largeMin / Math.max(smallMin, 0.001);
    // eslint-disable-next-line no-console
    console.info(
      `toSql 5 -> 50 conditions: ${smallMin.toFixed(3)} ms -> ${largeMin.toFixed(3)} ms (${ratio.toFixed(1)}×)`,
    );
    expect(ratio).toBeLessThan(MAX_SCALING);
  });
});

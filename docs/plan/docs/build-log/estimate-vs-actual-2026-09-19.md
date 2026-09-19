> Source: written by an Opus 5 worker of coordinating session https://claude.ai/code/session_01VzkGh4tYHNLaezQ6GqPTuf on 2026-09-19 and copied here verbatim; the `/workspace/linear-builder` paths it cites are now `docs/plan/` in `imagine-os/linear-os-test`.

# Estimate vs actual: the 2026-09-19 autopilot run

Model: Opus 5. Read-only analysis, 2026-09-19. All figures derived from files in `/workspace/linear-builder`
(`docs/cost-and-duration-estimate.md`, `docs/build-chunks.md`, `docs/execution-schedule.md`,
`plan/round4/chunks-v2.json`, `plan/round4/sched/sched-B.json`, `plan/round4/sched/graph.json`,
`docs/build-log/2026-09-19.md`, `CHANGELOG.md`) and the Linear survey in this scratchpad (`linear.md`).
Nothing here was measured from Claude usage/credits — that is not visible from inside a session.

---

## Short version (for Slack)

- Builder speed was accurate. Finishing work was not.
- The run produced roughly the number of *built* issues the plan expects for its length, but only 22 cleared
  review and merge — and almost none of those were code.
- Everything hard is still ahead: about 580 v0.1 issues remain, and four in five of them are code, versus
  fewer than one in five of what actually got Done.
- The bottleneck was never how fast builders write code. It was the merge queue and the review pass:
  branches are parked unmerged, and the template repo's `main` has been red since the first hour.
- The plan said all of v0.1 was 38 autopilot-hours. On the rates we actually measured it is more like
  55-75 hours, i.e. a couple of dozen more runs the size of the one we did.
- Cost is not readable from inside a session. The plan's figure is about $17 of list spend per issue —
  divide the Admin usage number for 01:11-03:19 UTC by that to see how far off we were.
- Fix the landing pipeline before buying more builder time; more builders without it just grows the pile.

---

## 1. What the plan estimated

Source: `docs/cost-and-duration-estimate.md` §9 "Round 4 results (2026-09-18)" and
`docs/build-chunks.md` §1-3 (mix B, canonical). Raw data: `plan/round4/chunks-v2.json`.

**Scope ("finish line")**

| Item | Plan value | Source |
|---|---|---|
| Specified issues in team PAP | 901 (105 umbrellas, 796 leaves) | cost-and-duration-estimate.md §9 |
| **Scheduled leaves for v0.1** | **601** (S 198 / M 401 / L 2; 1,609 points) | §9; build-chunks.md §1 |
| Deferred leaves (v0.2) | 195 | §9 |
| Type mix of the 601 | Build 409, Infra 68, Spec 59, Review 28, Research 20, Docs 17 | §9 (verified against `sched/graph.json`) |
| Phase mix | P0 156 / P1 314 / P2 131 | §9 |
| Umbrellas | complete automatically when their last child lands | build-chunks.md §1 |

**"Finish line" is RC3 = v0.1.0**, `docs/execution-schedule.md` §3: *"RC3 = v0.1.0 | 10-01 am | PAP-254 +
PAP-89 digest | Every non-deferred issue Done or Canceled with a reason; evidence ... attached; final burn
report."* Earlier gates: RC0 09-21 pm, RC1 09-24 pm (`v0.1.0-rc.1`), RC2 09-28 am. Freeze 09-30 12:00Z.
v0.2 (the 195 deferred) is explicitly after RC3 and gated on NJ-14/NJ-19.

**Chunks and money (mix B, canonical — the mix the `Chunk 1..5` labels encode)**

`docs/build-chunks.md` §3 table:

| Chunk | Issues | Points | List $ | To Justin | Hours | Window |
|---|---|---|---|---|---|---|
| 1 | 135 | 360 | $2,486 | $49.72 | 9.6 | 09-18T14:15Z → 09-18T23:50Z |
| 2 | 125 | 353 | $2,498 | $49.96 | 8.5 | → 09-19T08:20Z |
| 3 | 136 | 378 | $2,498 | $49.95 | 9.5 | → 09-19T17:50Z |
| 4 | 143 | 394 | $2,493 | $49.85 | 9.2 | → 09-20T03:05Z |
| 5 | 62 | 124 | $475 | $9.51 | 1.8 | → 09-20T04:50Z |
| **Total** | **601** | **1,609** | **$10,450** | **$209.00** | **38.6** | 09-18T14:15Z → 09-20T04:50Z |

- **5 chunks**, billed whole = **$250** to Justin (`docs/build-chunks.md` §2).
- Mix A (all Fable 5.1) for reference: 8 chunks, $18,522 list, $370.44, same 38.6 h.
- **+195 deferred (v0.2)**: +$3,418 list (+$68.36), +14.3 h. Everything = $13,868 list = **$277.35**, 52.9 h.

**Duration assumptions** (`cost-and-duration-estimate.md` §5 and §9, `build-chunks.md` §1)

- **16 concurrent builder sessions, 24/7**; reviewer and QA sessions run *on top of* that cap.
- Per-issue wall clock: **build S 30 min / M 75 min / L 180 min**, plus **review 20 min** and **QA 15 min**
  (code issues only).
- Branch-start rule: a dependent starts when its blocker's PR opens, not when the blocker is Done.
- Critical path 27.8 h (40.4 h without the branch-start rule); serial 925.8 h; **38.6 h at 16 builders**,
  mean builders busy 15.7 → "capacity-bound rather than chain-bound".
- Derived rate: **601 / 38.6 h = 15.6 issues landed per hour**; per builder-session-hour
  601 / (38.6 × 16 = 617.6) = **0.97 issues per builder-hour**. Equivalent statement: the average scheduled
  issue is 60.5 planned build-minutes, i.e. **about one issue per builder-hour, one session per issue**.
- Explicitly *not* in the 38.6 h (both docs say so): `Needs Justin` answers, **merge-queue conflicts on
  shared files**, and the 30% re-review bounce ("its tokens are in the x1.25 contingency, its minutes are not").

**Chunk 1 size and mix** (`chunks-v2.json` mix B chunk 1; matches `build-chunks.md` §3)

- 135 issues, 360 points, 9.6 h, $2,486 list / $49.72.
- Type: **Build 73, Spec 31, Infra 15, Research 14, Docs 2** (code = Build+Infra = 88, **65%**).
- Size: S 45 / M 90 / L 0. Phase: P0 93 / P1 40 / P2 2. Builders: Sonnet 53, Fable 46, Opus 36.
- Deliverable: **RC0** at 09-18T22:20Z, 2 milestones completed.
- 8 `Needs Justin` items had to be answered before chunk 1 started (NJ-1, 2, 3, 5, 6, 8, 9, 10).

**Implied unit prices** (from `plan/round4/sched/sched-B.json`, summing per-issue `total` = builder + reviewer + QA, contingency included)

| Unit | List $ | To Justin (×0.02) |
|---|---|---|
| Per scheduled issue (601 issues, $10,175 without RC reviews) | **$16.93** | $0.339 |
| Per scheduled issue including the 4 RC reviews ($10,450) | **$17.39** | $0.348 |
| Per builder-session-hour at 16 concurrent ($10,450 / 617.6) | **$16.92** | $0.338 |
| Per wall-clock hour at 16 builders ($10,450 / 38.6) | **$270.70** | $5.41 |

---

## 2. What actually happened

Source: `docs/build-log/2026-09-19.md` (19:18-20:00 UTC section) and the Linear survey.

**Clock.** Autopilot 2026-09-19 **01:11 → 03:19 UTC = 2 h 08 m = 2.133 h**. First code commit 01:34:39Z
(PAP-13), last commit 03:17:42Z. Credits out at 03:19; sessions died.

**Sessions.** 47 builder sessions in three waves (wave 0: 16 at 01:12; wave 1: 13 at 01:38-01:40;
wave 2: 18 at ~02:15-02:24), plus review batches 1-5, an integrator (three rewrites), 2 promotion passes,
3 scribe passes. Note this is **more than the plan's 16-concurrent cap** — the build log records
"~20 concurrent builders" causing push contention at 01:40.

**Outcome at 19:30 UTC** (Linear PAP): **22 Done, 10 In Review, 22 In Progress**, 10 Ready for Claude,
4 Needs Justin, 837 Backlog, 125 Triage. 46 follow-up issues filed (PAP-996 upward). 25 `feat/*` branches
unmerged, none ever run in CI; `empty-11` `main` red since 02:06:10Z.

### 2a. Throughput

| Measure | Count | Per hour (÷ 2.133) | Per builder session (÷ 47) |
|---|---|---|---|
| **Done** (merged + reviewed) | 22 | **10.3 / h** | 0.47 |
| **Built** (Done + In Review) | 32 | **15.0 / h** | 0.68 |
| **Touched** (Done + In Review + In Progress) | 54 | **25.3 / h** | 1.15 |

Builder-session-hours consumed is an **upper bound of ~73 h** (16 × 2.12 + 13 × 1.66 + 18 × 0.98), because
sessions that finished early stopped consuming and that idle time is not derivable. Against that upper
bound: **0.30 Done / builder-hour, 0.44 built / builder-hour** (plan: 0.97). Against a strict 16-concurrent
reading of the same window (34.1 builder-hours): 0.65 Done, 0.94 built per builder-hour. The true value sits
between; **"roughly half the plan's per-builder-hour rate" is the defensible statement**, and "at parity"
only if you count the 16-cap the plan assumed rather than the ~34 average concurrency actually run.

### 2b. Label mix — what got finished versus what is left

Computed from `plan/round4/sched/graph.json` (`type`, `estimate`) and mix-B chunk membership in
`plan/round4/chunks-v2.json`. All 54 touched issues are inside the 601 scheduled set.

| Set | n | Build | Infra | Spec | Research | Docs | Review | **Code share** | Chunk labels |
|---|---|---|---|---|---|---|---|---|---|
| **Done** | 22 | 2 | 2 | 9 | 8 | 1 | 0 | **18%** | C1 18, C2 1, C3 2, C4 1 |
| **In Review** | 10 | 3 | 1 | 5 | 1 | 0 | 0 | **40%** | C1 9, C5 1 |
| **In Progress** | 22 | 6 | 9 | 5 | 2 | 0 | 0 | **68%** | C1 16, C2 2, C3 1, C4 2, C5 1 |
| Chunk 1 as planned | 135 | 73 | 15 | 31 | 14 | 2 | 0 | **65%** | — |
| **Chunk 1 remaining** | 117 | 71 | 14 | 22 | 9 | 1 | 0 | **73%** | — |
| All 601 as planned | 601 | 409 | 68 | 59 | 20 | 17 | 28 | **79%** | — |
| **All v0.1 remaining** | 579 | 407 | 66 | 50 | 12 | 16 | 28 | **82%** | — |

**The easy issues went first, decisively.**

- Of 20 Research issues in the whole v0.1 scope, **8 are Done (40%)**. Of 59 Spec issues, 9 (15%).
- Of **475 code issues (Build 409 + Infra 68), 4 are Done — 0.8%.** Build alone: 2 of 409.
- Done averages **54.5 planned build-minutes** per issue; the remaining 579 average **60.8**. Adding the QA
  gate that only code issues carry (+15 min), fully loaded: Done **57.2 min**, remaining **73.1 min** —
  **the work left is 1.28× heavier per issue than the work finished.**
- Estimate sizes: Done 10 × S + 12 × M; remaining 188 × S + 389 × M + 2 × L.

### 2c. Plan-dollar value of what landed

Summed per-issue `total` from `plan/round4/sched/sched-B.json`:

| Set | List $ | To Justin | Share of the $10,175 issue budget |
|---|---|---|---|
| Done (22) | **$349.43** | $6.99 | 3.4% |
| Done + In Review (32) | $515.78 | $10.32 | 5.1% |
| All touched (54) | $839.78 | $16.80 | 8.3% |
| Remaining 579 | $9,825 | $196.50 | 96.6% |

A 2.133 h slice of the plan's own schedule would have booked **$578 list ($11.55)** and landed ~33 issues.

---

## 3. Was the estimate accurate?

### (a) Throughput per builder-hour — **accurate on building, wrong on finishing**

- Like-for-like on the plan's own clock: a 2.133 h slice at 16 builders lands **33 issues**. Actual:
  **32 built (97%)**, **22 Done (67%)**.
- But 47 sessions ran, not 16 — about **twice the concurrency for the same output**, so the real
  per-builder-hour rate is **0.30-0.44 issues/builder-hour against a planned 0.97**, i.e. **~45% of plan**.
- And the output was the **cheap half of the mix**: 18% code versus the 65% code the plan put in chunk 1.
  On like-for-like difficulty the shortfall is larger still (×1.28 mix factor, §2b).
- The per-issue *build* time assumption itself held up: the 32 built issues represent 29.5 builder-hours of
  planned build minutes, produced inside a 2.133 h window — builders were not slower than S 30 / M 75.

**Verdict:** the token/duration model of a *single builder session* was sound. The model of a *pipeline*
was not.

### (b) The landing / merge pipeline — **the estimate's biggest miss, and it was a known omission**

The plan says in three places that merge-queue conflicts are excluded from the 38.6 h
(`cost-and-duration-estimate.md` §5, §9; `build-chunks.md` §1-2). Actual:

| Planned | Actual |
|---|---|
| Builders open a PR; reviewer 20 min, QA 15 min, then Done | No PRs at all (git-only operating mode, decision 0001); a serial integrator became the only path to `main` (decisions 0002, 0003) |
| Landing is a non-event in the schedule | Push contention with ~20 concurrent builders — PAP-176 lost 10 races (01:40 log) |
| — | `git merge -X union` unsupported → two silent no-op "merges" at 02:07 |
| — | Union-merging `package.json` produced invalid JSON → 5 branches stuck `check-failed` / `needs-manual-merge` |
| — | Integrator rewritten to v3 (rebase landing) inside 90 minutes |
| — | Permission checker denied `git push HEAD:main` for builders, and again for the coordinator's own green fix branch |
| — | Integrator token cannot delete refs (403) → merged branches accumulate |
| 0 stuck branches | **25 unmerged `feat/*` branches**, 12 more merged-but-undeleted, **none ever run in CI** (`ci.yml` triggers on push-to-main and PRs only) |
| `main` green throughout | `empty-11` `main` **red since 02:06:10Z**; fix exists on `fix/main-green-2026-09-19` (`280e1453`, local gate green) but could not be pushed |

Three of the parked branches are load-bearing: `feat/PAP-754-review-fixes` (an S1 script-injection fix on an
issue already marked **Done**), `feat/PAP-433-module-manifest-schema` (top Backlog blocker — 36 issues wait
on it), and `feat/PAP-15-*` (the only Pages deploy workflow).

**Verdict:** not accurate, and the gap is exactly the one the plan flagged and then did not price.

### (c) Cost — **not derivable from inside a session**

Credit consumption is not visible to an agent (`build-log/2026-09-19.md`: "Justin reads it at claude.ai →
Admin settings → Usage"). Divisors for Justin to do the arithmetic against the **01:11-03:19 UTC** window:

| Divide the Admin usage $ by… | …to get |
|---|---|
| **$17.39** | plan-equivalent issues bought (list $ per scheduled issue incl. RC reviews) |
| **$16.93** | same, issue budget only |
| **$349.43** | the overrun multiple on work that actually reached **Done** |
| **$515.78** | the overrun multiple on work **built** (Done + In Review) |
| **$578** | the overrun multiple versus what the plan would have booked for a 2 h 08 m slice |
| **$16.92** | plan-equivalent builder-hours bought |

If Admin usage for that window reads roughly $580, the run was on plan in dollars but delivered 2/3 of the
issues. If it reads several thousand, the per-issue cost model needs re-baselining before the next run —
which is precisely the "$400 pilot to re-baseline these assumptions" that
`cost-and-duration-estimate.md` §7 recommended and that this run effectively became.

### (d) Wall clock — **the calendar, not the throughput, is what slipped**

- Plan clock: 2026-09-18T14:15Z → 2026-09-20T04:50Z, 38.6 h, all 601 done.
- Actual: the build did not start until 2026-09-19T01:11Z (**~11 h after the plan's clock start**) and ran
  **2 h 08 m (5.5% of the 38.6 h)** before credits ended. Then **16 h of dead time** (03:19 → 19:18) with
  nobody to answer the thread.
- At the point the plan has chunks 1-2 finished and RC1 reached (09-19T08:20Z), reality has 22 Done (3.7%)
  and RC0 not reached (RC0 needs PAP-25/30/269 staging, which is blocked on NJ-2, Hetzner).
- **Elapsed calendar has been ~92% overhead** (credits, human gates, dead time) and ~8% building.

---

## 4. What is left to reach the finish line

**Assumptions stated up front**

1. Finish line = **RC3 / v0.1.0**: every non-deferred issue Done or Canceled (`execution-schedule.md` §3).
   That is the **601 scheduled leaves**; the 105 umbrellas roll up for free; the **195 deferred (v0.2)** are
   *not* in these numbers.
2. Remaining = **579 issues** (601 − 22 Done). Of those, 10 are built and waiting to land, 22 have a branch
   in flight, and **547 have not been started**.
3. Same operating shape as the run that happened: 16-18 concurrent builders, reviewers and integrator on top.
4. "A run" = **2 h 08 m of autopilot**, the length of the one we did.
5. Mix factor **×1.28** applied where the rate was measured on the finished (easy) work — the remaining
   issues are 82% code versus 18% for what is Done (§2b).
6. Re-review bounce (plan: 30%) and `Needs Justin` waits are excluded from every line, as in the plan.

| Scenario | Rate used | Hours for 579 | ≈ 2 h runs |
|---|---|---|---|
| **Plan's own rate** (what was promised) | 15.6 landed/h | **37 h** | 17 |
| **Observed built rate**, assuming the landing pipeline is fixed and keeps up | 15.0/h | 39 h | 18 |
| ↳ same, **adjusted for the heavier remaining mix** (×1.28) | 11.7/h | **50 h** | 23 |
| **Observed Done rate** (pipeline behaving as it actually did) | 10.3/h | 56 h | 26 |
| ↳ same, **mix-adjusted** (×1.28) | 8.1/h | **72 h** | 34 |
| Integration backlog: drain 25 parked branches, first-ever CI on each, red-fix cycle | not derivable | **+2 to 4 h** | +1 to 2 |
| v0.2 afterwards (195 deferred), plan figure | — | +14.3 h | +7 |
| v0.2 afterwards, at the mix-adjusted observed Done rate | 8.1/h | +24 h | +11 |

**Headline range for v0.1: 50-75 autopilot hours, plus 2-4 hours to drain the backlog first — roughly
25-35 more runs the size of the one we did.** The plan's remaining figure is 36.5 h (38.6 − 2.1), so the
honest read is **1.4× to 2.0× the original estimate, centred around 1.5×**. Adding v0.2 takes the total to
roughly **75-100 autopilot hours**.

Two things could move that materially in the good direction and neither is builder speed: (1) landing all 25
parked branches converts ~19 builder-hours of already-paid work into Done without rebuilding anything, and
(2) `feat/PAP-433-module-manifest-schema` alone unblocks 36 Backlog issues (PAP-434 another 30, PAP-537
another 29, PAP-43 another 26 — promotion pass 2, 02:24 UTC).

**The biggest uncertainty is the merge queue and review capacity, not builder speed.** The data supports
this plainly:

- Builders produced 32 built issues in a window where the plan books 33 landings — build throughput is fine.
- Of 475 code issues, **4 are Done (0.8%)**, while 8 of 20 Research issues are Done (40%). What failed is the
  path from "a builder finished" to "it is on `main` and green", and that path has only been exercised on
  docs and spec work so far.
- 25 branches are parked and **not one has ever run in CI**, so their true pass rate is unknown; the build
  log's own next-steps say "every landing gets a CI run for the first time, so expect a red-fix cycle".
- The integrator was rewritten three times in 90 minutes and still cannot delete refs; the permission
  checker blocks direct pushes to `main` for builders *and* for the coordinator.
- Reviewers and QA run **on top of** the 16-builder cap in the plan, but in the run they competed for the
  same session budget as the builders (5 review batches, 2 promotion passes, 3 scribe passes inside 2 h).

A second, smaller uncertainty: **17 `Needs Justin` items** are still unanswered or defaulted (4 open cards,
plus NJ-2/3/5/6/7/9/10/11/12/13/18 across chunks 1-2), and RC0 cannot be reached at all until NJ-2 (Hetzner)
is resolved. Those set the calendar, not the clock.

---

## 5. Not derivable from the available files

- Actual credit/token spend for the run (visible only in claude.ai → Admin settings → Usage).
- Actual per-session wall-clock durations (session end times were not logged per builder; only the wave
  launch times and the 03:19 cut are recorded).
- True idle time of builder sessions that finished before the cut, so builder-hours consumed can only be
  bounded (≤ ~73 h), not measured.
- The CI pass rate of the 25 parked branches — none has ever run in CI.
- Whether the 22 In Progress issues' work survives: their sessions are gone, and some branches never reached
  the remote (`build-log/2026-09-19.md`, parked-branch table).

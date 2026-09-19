# The orchestrator loop (PAP-281)

The half of the orchestrator that talks to Linear: the poll cycle, the atomic
claim, the state transitions, `linearComment()` and the tables everything
else records into. Worktrees and the real Claude Code launch are PAP-282;
deployment and the runbook are PAP-283; the Backlog → Ready for Claude
promotion pass is PAP-691; webhooks are PAP-97.

## Quick start

```sh
pnpm orchestrator:loop            # read-only: print what the next cycle would claim
pnpm orchestrator:loop --apply    # run one cycle for real
pnpm orchestrator:loop --apply --watch   # keep cycling, serve /healthz and /status
pnpm orchestrator:status          # what the loop currently holds (no Linear calls)
pnpm orchestrator:status --json
```

In a Claude Code sandbox `@linear/sdk` uses Node's global `fetch`, which
ignores `HTTPS_PROXY` unless the env-proxy agent is on, so the proxy never
injects the real key and the run dies with `Authentication required`. Prefix
every live command:

```sh
NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt \
  LINEAR_API_KEY=placeholder pnpm orchestrator:loop
```

## One cycle

```
recover (first cycle only) → claim × free slots → launch → registered passes
```

1. **Recover.** Claims left behind by a crashed process are released, and a
   session that was `running` is marked `interrupted`. This is why a restart
   never strands an issue in `In Progress` with nobody working on it.
2. **Claim.** Up to `maxParallel` minus the claims already held.
3. **Launch.** Each claim goes to the `SessionLauncher`. The default is
   `DryRunLauncher`, which only logs — PAP-282 registers the real one.
4. **Passes.** Every function registered with `loop.registerPass(name, fn)`
   runs, in registration order, with the cycle's claims. PAP-691's promotion
   pass and PAP-703's SLA evaluator attach here; `loop.ts` does not change
   when they land.

`loop.wake()` cuts the wait short so PAP-97's webhook receiver gets a reaction
in under a second instead of within `pollIntervalMs`.

## The claim handshake

| Step | What | Why |
|---|---|---|
| 1 | Poll `Ready for Claude`, unassigned, `Deferred` excluded server-side | the queue |
| 2 | `orderQueue()` — priority, then age, then identifier | deterministic across replicas; PAP-99 replaces it |
| 3 | Drop umbrellas and `Deferred` issues, one comment each | Umbrella rule, Deferred rule |
| 4 | `INSERT` into `claims` (`issue_id` PRIMARY KEY) | **the atomicity.** Of N concurrent callers exactly one insert succeeds |
| 5 | Re-read the issue, compare `updatedAt` with `updated_at_seen`, re-check labels | the guard: anything that moved under us releases the claim |
| 6 | `issueUpdate` → assignee + `In Progress` | the only Linear write of the handshake |
| 7 | Re-read: are we the assignee, is it `In Progress`? | another replica's write wins → release |

**Deviation from PAP-281's Spec text, on purpose.** The spec says
"`issueUpdate(...)`; re-read and compare `updatedAt` to `updated_at_seen`; on
mismatch release". A comparison strictly after our own write can never match,
because our write is itself an update. The guard is therefore taken *before*
the write — which is exactly what the spec's own edge case describes ("issue
leaves Ready for Claude between poll and claim: `updatedAt` guard fails,
skip") — and the read after the write verifies the different thing that
matters: that our write is the one that stands.

`SELECT … FOR UPDATE SKIP LOCKED` is the Postgres spelling of step 4. SQLite
has no `SKIP LOCKED`; the primary key plus `INSERT OR IGNORE` gives the same
single-winner guarantee, and `db/schema.ts::CLAIM_INSERT` carries both
statements side by side.

## Transitions

| Function | Move | Notes |
|---|---|---|
| `toInReview(issue, evidence, footer?)` | `In Progress → In Review` | build-loop: `evidence` is the commit list, no PR, no attachment. pr-flow: `evidence` must be a PR URL, attached, `pr.detected` emitted |
| `retry(issue, reason)` | `In Progress → Ready for Claude` | adds `retry-<n>`, capped by `claim.maxRetries` (2); past the cap it escalates instead |
| `escalate(issue, reason)` | `→ Needs Justin` | posts a PAP-94 card: what happened, decision needed, default if no answer |

There is **no** `toDone()`. In build-loop mode the review pass moves an issue
to Done (session playbook §8), and the security deny list forbids the loop
from doing it. A test asserts the export does not exist.

## `linearComment()`

Every comment the orchestrator posts goes through it: the PAP-92 footer is
appended (unless the body already ends in a `paperos-session` fence), the body
is hashed, and `(issue_id, sha256(body))` in `comments_sent` makes an
identical repeat a silent skip. `RATELIMITED` sleeps 60 s and retries five
times. If the post throws, the dedupe row is rolled back so the comment is not
lost forever.

## Build-loop mode

`mode` in `orchestrator.config.yaml` carries the same two values as PAP-93's
`ContractMode`, so the loop and the validator cannot disagree about what
"In Review" means.

| | `build-loop` (today) | `pr-flow` (target) |
|---|---|---|
| In Review means | pushed to `main` with a `Session ended` comment | a PR exists |
| An `In Review` blocker | closed, no PR check | closed only with an open PR |
| `toInReview` evidence | commit SHAs | PR URL, attached |
| `BASE_BRANCHES` | empty (everything is on main) | the In Review blockers' branches |
| Done | the review pass | the merge flow |

## Tables

`sessions`, `claims`, `events`, `comments_sent`, `promotions`, `retries` —
`src/db/schema.ts`, one DDL for SQLite (dev) and one for Postgres schema
`orchestrator` (production), same shapes. `contract_checks` is PAP-93's table
and is deliberately not defined here. `promotions` is created here because
PAP-691 consumes "PAP-281's ids and tables" and every statement is
`IF NOT EXISTS`, so its own migration is a no-op on a database this one
already opened.

**Driver.** PAP-96's spec names `better-sqlite3`. It is a native module and
pnpm would need an `allowBuilds` entry in the root `package.json`, a root file
this issue does not own. `node:sqlite` is the same SQLite engine with no build
step, and PAP-93 already chose it for `contract_checks`, so the orchestrator
speaks to one driver. Swapping in `better-sqlite3` later is a one-file change:
it satisfies the `SqliteLike` interface as it stands.

## HTTP

`GET /healthz` → `{ ok, at }`. `GET /status` → mode, team, slots, claims,
sessions, registered passes, validator availability, the last 20 events. Two
read-only endpoints on `node:http`, no framework: PAP-283 deploys it and
PAP-113 renders it.

## The PAP-93 validator

`src/validator.ts` asks for `src/contract/index.js` at run time. If PAP-93 is
on main, `validateIssue` and `isOpen` are there and `/status` says
`validator: "available"`; if it is not, the bridge returns `null` and every
report says `validator: "unavailable"`, which is the fallback PAP-96 and
PAP-691 prescribe. Nothing needs editing when PAP-93 lands — the import simply
starts resolving. `tests/promotion-graph.test.ts` then asserts that PAP-93's
`isOpen` and this repo's `isOpenBlocker` agree on every blocker in the fixture
graph, which turns the `promotion.validator_mismatch` guard into a build-time
failure instead of a run-time log line.

## What PAP-281 does not build

Promotion. PAP-691 exists as a separate child of PAP-96, so per the round-4
amendment `promote()`, the `promotions` writes, `templates/promoted.md`
rendering and `pnpm linear:promote` belong to it. What this issue hands over
is the vocabulary those checks are made of — `isDeferred` (check 1),
`isUmbrella` (check 2), `isOpenBlocker` / `blockersOf` / `baseBranchesFor`
(check 3, the branch-start rule) — the `promotions` table, the
`loop.registerPass` seam, and `tests/fixtures/promotion-graph.json`, the
fixture graph from PAP-96's Test plan with a test proving checks 1-3 already
give the expected verdicts and that `PAP-i` is caught by check 4 alone.

## Configuration

`orchestrator.config.yaml`, validated by `src/config.ts` (Zod). Every field
has a default, so a missing file is a working configuration. The one thing
that must be set before the loop assigns anybody is `botUserId`: until PAP-48
creates the per-character bot users it is `null`, and `claimNext()` claims the
issue unassigned and warns once per claim.

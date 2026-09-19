# Linear setup for team PAP (PAP-91)

This documents the live configuration of Linear team **PAP**
(https://linear.app/paperos, team id `0ee78894-89f8-4376-a829-f8685dbc1868`)
as of 2026-09-19, what `ops/linear/configure-workspace.ts` treats as correct
versus what it adds, and why a few things that look like gaps are
deliberate.

## Workflow states

| State | Type | Notes |
|---|---|---|
| Triage | triage | Intake for Slack/GitHub/agent-found items; Atlas sorts it into Backlog. Never claimable. |
| Backlog | backlog | Specified, waiting on blockers or promotion. |
| Todo | unstarted | **Human parking — never polled by the orchestrator or claimed by an agent.** Kept because Linear ships it by default and some issues sit here intentionally (e.g. things Justin wants to look at by hand); it is documented rather than removed because removing a default state is exactly the kind of change PAP-91 refuses to make. |
| Ready for Claude | unstarted | The only state a builder session may claim from. |
| In Progress | started | Claimed by exactly one session, working in a git worktree. |
| In Review | started | A PR/branch exists; gates and reviewers run. |
| Needs Justin | started | A human decision is required (accounts, secrets, paid services, irreversible external actions). |
| Done | completed | Only the merge flow moves an issue here. |
| Canceled | canceled | |
| Duplicate | duplicate | |

All ten already existed before PAP-91 and are treated as correct: this
script never creates, renames, or retypes a state. If a state is ever
renamed by hand, `--check` reports it as `manual` drift and never renames it
back (see `src/linear/diff.ts::diffStateNames`).

## Team settings

| Setting | Value | Notes |
|---|---|---|
| `issueEstimationType` | `fibonacci` | Already live; Fibonacci points (2 = S, 3 = M, 5 = L) feed cycle capacity. |
| `cyclesEnabled` | `true` | One-week cycles; cycle 1 (`C1 Foundation & core systems`) is active. |
| `triageEnabled` | `true` | Inbound issues land in `Triage` for Atlas to sort. |

These already matched the desired configuration at the time PAP-91 ran, so
`--check` reported no drift here. The diff engine still carries a
`teamUpdate` path (`src/linear/diff.ts::diffTeamSettings`) for if one of
these three ever drifts — reported and, on `--apply`, corrected, since the
spec names this as the one team-setting surface this script owns.

## Labels

### Existing groups (treated as correct, never modified)

`Phase` (P0/P1/P2), `Type` (Research/Spec/Build/Review/Infra/Docs), `Model`
(Fable 5.1/Opus 5/Sonnet 5/Haiku 4.5), `Reasoning effort`
(low/medium/high/max), `Chunk` (1-5, v0.2), plus the workspace labels Bug,
Feature, Improvement, and `Deferred`.

### Surface labels (live: grouped under `Surface`)

`Customer`, `Staff`, `Developer` and `Agent` are children of the `Surface`
group label in the live team, and `linear-workspace.json` keys them
`Surface/Customer` … `Surface/Agent` accordingly. Consumers (PAP-93, PAP-96,
PAP-99) must use the grouped keys, not the bare names.

`src/linear/desired.ts` does **not** declare these labels, so this script
never creates, moves or reparents them — they are read as a live fact, and a
change to their shape is reported as drift, never "corrected". The PAP-91
spec's premise (surfaces ungrouped, with 53 issues carrying more than one
surface) was true of the 2026-09-18 plan snapshot and is no longer true of the
live workspace: a sample of 250 team-PAP issues on 2026-09-19 found **zero**
issues carrying more than one surface label, which is what a group constraint
forces (Linear allows one label per group per issue). Whoever grouped them is
outside this issue's history; if the multi-surface information mattered, it
needs recovering from Linear's issue history, which is tracked as a follow-up
rather than silently re-created here.

### Added by PAP-91: `Character`

Nine labels, one per PaperOS agent character, grouped under `Character` so
PAP-99 can route an issue to the right builder identity:

`Character/Atlas`, `Character/Forge`, `Character/Iris`, `Character/Quill`,
`Character/Sentinel`, `Character/Nova`, `Character/Ledger`,
`Character/Beacon`, `Character/Scout`.

### Added by PAP-91: round-4 amendment labels

`gates-pending`, `stuck`, `slack-risk`, `critical-path`, `source:slack`,
`triaged` — all flat (ungrouped), matching the shape of the other
operational tags. The `sla:*` family named in the amendment is a wildcard
with no concrete member named by any spec yet, so no `sla:*` label was
created; a future spec that names a concrete `sla:<n>h` label adds it to
`src/linear/desired.ts` and this script picks it up on the next `--apply`.

## Templates

The `PaperOS Spec` issue template's body was rewritten to the eleven-section
issue contract (Goal, Scope, Spec, Interface contract, Test plan,
Definition of done, Edge cases, Dependencies, Agent, Size, Demo, with a
`**Model / Effort:**` first line) that PAP-93 defines and every hand-written
spec under `specs/` already follows. It previously carried a pre-round-1
section list (Design / Approach, Page spec, Acceptance criteria,
Verification, Edge cases & failure modes, Dependencies & risks, Artifacts to
produce) that had drifted from what specs actually use.

The other six issue templates (Sub-feature child, Gap issue, Research spike
+ ADR, Needs Justin card, Gate failure / bug report, Release candidate) and
the `PaperOS module project` project template already exist and already
match their documented shape (see `docs/linear-features.md` in
`linear-builder`); PAP-91 does not touch them.

## What `--check`/`--apply` do and don't do

* Reads the live team, diffs it against `src/linear/desired.ts`, prints a
  `(kind, name, field, live, wanted, status)` table.
* `--apply` only ever issues `issueLabelCreate`, `issueLabelUpdate` (parent
  reassignment only), `templateUpdate` (description/body only),
  `workflowStateUpdate` (description/color only — never used today because
  no state description/color drift exists) or `teamUpdate` (the three
  settings above). There is no delete, archive, rename, or retype code path
  anywhere in `src/linear/apply.ts`.
* Refuses to run unless the team key is `PAP` or `--team` names it
  explicitly, and refuses `--apply` before any mutation if the API key
  isn't admin-scoped.
* Writes `linear-workspace.json` with every state/label/template/
  project/cycle id, which `src/linear/workspace.ts::WorkspaceIds` types and
  downstream code (`src/loop.ts` and later PAP-93/96/99) imports.

## Running the script in an agent sandbox

`@linear/sdk` uses Node's global `fetch`, which ignores `HTTPS_PROXY` unless
the env-proxy agent is turned on. In a Claude Code sandbox the request then
goes out directly, the proxy never injects the real API key, and the run dies
with `Authentication required, not authenticated`. Run it as:

```sh
NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt \
  LINEAR_API_KEY=placeholder pnpm linear:configure --check
```

Verified 2026-09-19: prints `Team PAP (...)` then `(no drift)` and exits 0.

## Follow-up not done in this session

The Definition of done asks for a screenshot of the workflow-state settings
page at 1280px. That page requires an interactive browser login this
session does not have (see the Linear comment on PAP-91 and the "Needs
Justin" note in the final report) — noted as a follow-up rather than
skipped silently.

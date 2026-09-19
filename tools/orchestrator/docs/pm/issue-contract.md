# The issue contract (PAP-93)

What a Linear issue in team PAP must contain before a machine may build it, and how the contract is enforced. Owner: Atlas; reviewer: Sentinel. Code: `src/contract/` in `paperos-orchestrator`; rules here and in the code are the same list, the code wins on a disagreement and this file gets a fix.

The rules were fitted to the live workspace on 2026-09-19: every specified issue in the queue passes them unchanged (warnings allowed). Nothing here asks for bulk edits of existing issues.

## 1. Sections

The description holds the eleven sections of the `PaperOS Spec` template. A heading is a line that is only `**Name**` (the style every live issue uses) or `## Name`; a plain `Name:` line is not a heading. Case and the variants `DoD`, `Interface`, `Tests`, `Edge-cases` are normalised. Any order is accepted; the eight required sections out of the template's relative order only warn (`SECTION_ORDER`).

| Section | Rule | Code |
|---|---|---|
| Goal, Scope, Spec, Definition of done, Edge cases, Dependencies, Agent, Size | required, non-empty | `MISSING_SECTION` / `EMPTY_SECTION` (error) |
| Interface contract, Test plan, Demo | recommended | `MISSING_SECTION` (warn) |
| Size | starts with `S`, `M` or `L` (`Small`/`Medium`/`Large` normalise; prose after the letter is fine: `M: one session.`) | `BAD_SIZE` (error) |
| Scope `Files:` lines | optional globs for PAP-99, `parseFilesGlobs(scope)` | none |

Descriptions over 50,000 characters are truncated before parsing and flagged `DESCRIPTION_TOO_LONG` (warn); whatever the truncation cuts off is then reported as missing.

## 2. Metadata

| Rule | Code |
|---|---|
| exactly one `Phase/*` label | `LABEL_PHASE` (error) |
| exactly one `Type/*` label | `LABEL_TYPE` (error) |
| at least one surface label: `Surface/Customer`, `Surface/Staff`, `Surface/Developer`, `Surface/Agent` | `LABEL_SURFACE` (error) |
| a `Character/*` label (PAP-91 has landed, so this is now a warning) | `LABEL_CHARACTER` (warn) |
| a project | `NO_PROJECT` (error) |
| `Type/Build` issue whose Scope names a route (`/settings`, `/api/v1/tables/:id`, `/app/[tenant]/inbox`; not a file path) links a spec: a `specs/**/*.spec.yaml` path or a Linear document URL in the body or an attachment; a sub-issue inherits its parent's link | `NO_SPEC_LINK` (warn until `strictSpecLinkFrom` = 2026-09-22, error after) |

The Linear estimate is not required (Size is read from the body). Labels arrive as `Group/Child` or as `{name, group}`; both work.

## 3. Readiness

These codes say "not claimable now", not "the body is malformed". The webhook bounces on them like on any error but does not add the `needs-contract` label.

**Open blocker.** An inbound `blocks` relation comes from an open issue. `isOpen(blocker, { mode })` in `src/contract/open.ts` is the one definition and PAP-96's promotion check 3 imports it:

| Blocker state | pr-flow (plan target) | build-loop (2026-09-19 org policy, default) |
|---|---|---|
| Backlog, Todo, Ready for Claude, In Progress, Needs Justin | open | open |
| In Review | open unless an open PR is attached / found for its branch (branch-start rule) | closed (In Review means pushed to main with a Session ended comment) |
| Done, Canceled, Duplicate | closed | closed |
| anything else (Triage, unknown) | open | open |

`mode` comes from config (`PAPEROS_CONTRACT_MODE`, `--mode`), default `build-loop`; switch to `pr-flow` when Justin reinstates PRs.

| Code | When | Fix text |
|---|---|---|
| `BLOCKED_BY_OPEN` (error) | issue in any state other than Ready for Claude has an open blocker; PAP-96 promotion evaluates it on every Backlog candidate, so a Backlog row with this code is "not promotable yet", nothing is posted | each open blocker with state and PR status, then the two remedies: wait for the blocker to close, or soften the dependency (delete the relation, write the soft dependency with its fallback into Dependencies) |
| `READY_BUT_BLOCKED` (error) | issue is in Ready for Claude and has an open blocker (promoted or hand-moved, then blocked again) | same |
| `UMBRELLA_NOT_CLAIMABLE` (error) | issue has sub-issues and is in Ready for Claude, In Progress, or is a claim target | lists the children with states and names the first child in build order to claim instead |

Umbrella rule: an issue with sub-issues is never moved to Ready for Claude and never claimed; children are claimed like any issue; the session that finishes the last child runs the umbrella's integration test, attaches the evidence and moves the umbrella to In Review (that move passes: In Review is not a claim).

## 4. Where the contract does not apply

* `Canceled` and `Duplicate` issues: exempt (`ok: true`, no violations).
* `Triage` issues (round-4 intake skeletons carrying Goal + Source, or a body with a placeholder Size): shape rules are downgraded to warnings so intake never reads as broken; readiness rules still apply. Atlas writes the eleven sections when accepting an issue into Backlog.

## 5. Result shape

```ts
validateIssue(issue: ContractIssue, config?): ContractResult
// { ok: boolean /* no error-severity violation */, violations: [{ code, severity: "error" | "warn", message, fix }] }
```

`ContractIssue` is the validator's input (`src/contract/types.ts`); `toContractIssue(node)` maps a Linear GraphQL node (`ISSUE_FIELDS`) onto it, a fixture file is one verbatim. Also exported: `parseSections(markdown)`, `parseFilesGlobs(scope)`, `isOpen(blocker)`, `errorCodes(result)`, `warnCodes(result)`, `renderViolationsComment`, `renderAuditTable`.

## 6. Enforcement

**Webhook** (`src/webhook/handler.ts`, receiver `src/webhook/server.ts`, `pnpm contract:webhook`). On `Issue` `update` whose state changed to `Ready for Claude`: fetch, validate, store the result in `contract_checks`, then

* no violations: silence;
* warnings only: post the violations comment;
* errors: move the issue to `Backlog`, add `needs-contract` when a shape error is present (label id from `linear-workspace.json`; missing today, see §8), post the comment;
* if the last actor is Justin: post the comment, never move or label;
* the validator's own actor ids are ignored; a delivery is processed once per `webhookId`;
* a blocker moving from a closed state to an open one re-validates its Ready dependents and bounces them with `READY_BUT_BLOCKED`.

The comment is `templates/violations.md`: a table (code, severity, what, fix), the action taken, and a `paperos-session` footer with `status: "contract-failed"`, `character: "orchestrator"`, `reason: "<error codes>"` that validates against PAP-92's schema.

**Audit** (`pnpm contract:audit`, `src/cli/contract-audit.ts`). Read-only; `[--state Backlog] [--issue PAP-n] [--mode build-loop|pr-flow] [--only-errors] [--max-rows n] [--json] [--strict-readiness] [--from snapshot.json] [--out file.md]`. Pages the whole team at 100 issues per request (~830 complexity of the 10,000 budget), prints a Markdown table: per-state summary, code histogram, the pre-promotion list (Backlog rows with zero errors that are leaves and not `Deferred`: exactly what PAP-96 promotes next cycle), then one row per issue. Exit 1 on any shape error, 0 otherwise, 2 when Linear was unreachable; `--strict-readiness` also fails on readiness codes. In the build-loop sandbox Node's `fetch` needs `NODE_USE_ENV_PROXY=1` to reach Linear through the agent proxy (`curl` does not). Live run of 2026-09-19: `docs/pm/audits/2026-09-19-issue-contract-audit.md`.

**Storage.** `contract_checks(issue_id, checked_at, ok, violations_json)` plus `webhook_deliveries(webhook_id, received_at)`; DDL in `src/contract/store.ts`, in-memory and `node:sqlite` implementations behind `ContractCheckStore`.

## 7. Fixtures and tests

`fixtures/contract/good/` (12) and `fixtures/contract/bad/` (20) are `ContractIssue` files with the expected verdict; `fixtures/contract/webhooks/replay.json` holds 30 recorded-shape deliveries (20 distinct, 10 duplicates). `tests/contract/` covers every code, both modes, the six `BLOCKED_BY_OPEN` cases, umbrella cases, heading normalisation, 50 k truncation, the Justin and own-actor rules, replay idempotency, the SQLite store and the CLI. `pnpm test:coverage` reports `validate.ts` at 100 percent lines.

## 8. Known gaps (2026-09-19)

* The `needs-contract` label does not exist in the workspace yet; add it to `src/linear/desired.ts` (PAP-91's file) and run `pnpm linear:configure --apply`, then the handler labels bounces automatically.
* The receiver is not deployed: the live bounce demo needs a public URL, a Linear webhook subscription (Issue updates, team PAP) and `LINEAR_WEBHOOK_SECRET`; PAP-97 owns the real receiver.
* The API key in use is Justin's user, so the "last actor is Justin" rule and the own-bot rule would collide until a dedicated bot user (PAP-48) exists; set `PAPEROS_BOT_ACTOR_IDS` and `PAPEROS_JUSTIN_ACTOR_ID` per environment.
* PR detection in pr-flow mode uses PR attachments on the blocker; the `gh pr list --head` fallback is the `prForBranch` hook on `toContractIssue`, unwired until a forge token exists.
* `NO_SPEC_LINK` becomes an error on 2026-09-22 for about 130 `Type/Build` Backlog issues that name a route without a spec link; PAP-307 (drafting help) or a date change in config decides.

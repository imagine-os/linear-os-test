# Surfaces (MCP / CLI / API abilities)

Append a section here for any MCP, CLI or API ability your issue adds
(brief rule 10). One section per issue, oldest first.

## PAP-91: `pnpm linear:configure`

* **CLI**: `pnpm linear:configure --check|--apply [--team PAP]` —
  `ops/linear/configure-workspace.ts`. Diffs team PAP's live Linear
  configuration against `src/linear/desired.ts` and, on `--apply`, creates
  the `Character` label group (9 children) and the six round-4 amendment
  labels, and rewrites the `PaperOS Spec` template body to the eleven-
  section issue contract. Never deletes, archives, renames, or retypes
  anything.
* **API**: reads/writes Linear team PAP over the GraphQL API
  (`https://api.linear.app/graphql`) via `@linear/sdk`'s `LinearClient`,
  using `LINEAR_API_KEY` with no `Bearer` prefix (the PaperOS proxy injects
  the real key).
* **Output**: `linear-workspace.json` (committed), typed as `WorkspaceIds`
  in `src/linear/workspace.ts`. Consumers: PAP-93 (label/state ids), PAP-96
  (state ids for claims), PAP-99 (Character routing), PAP-22 (`paperos
  create` reuses the script).

## PAP-92 session playbook (CLI)

| Ability | Surface | Command | Notes |
|---|---|---|---|
| Playbook dry run | CLI | `pnpm playbook:dryrun` | Offline toy session for `PAP-9999`: renders `Session started`, `progress`, `Session ended` from `templates/` and validates each footer against `src/agents/session-footer.schema.json`. Writes nothing to Linear. |
| Footer validation | CLI | `pnpm footer:validate [file.json ...]` | Validates footers (files or the built-in toy fixtures) with ajv; prints `ok <name>` per footer, exit 1 on any failure. |
| Footer schema and type | Library | `src/agents/session-footer.ts` (`SessionFooter`, `PLAYBOOK_VERSION`, `parseFooter`, `renderFooter`) | Consumed by PAP-96 (state from footer), PAP-97/98 (`status`, `costUsd`), PAP-105 (templates). |

## PAP-93: issue contract (`pnpm contract:audit`, webhook)

* **CLI**: `pnpm contract:audit [--state Backlog] [--issue PAP-n] [--mode build-loop|pr-flow] [--only-errors] [--max-rows n] [--json] [--strict-readiness] [--from snapshot.json] [--out file.md]` —
  `src/cli/contract-audit.ts`. Read-only audit of team PAP against the issue
  contract (`docs/pm/issue-contract.md`); prints the Markdown table with the
  pre-promotion list. Exit 1 on a shape error, 2 when Linear is unreachable.
* **CLI**: `pnpm contract:webhook` — `src/webhook/server.ts`, `node:http`
  receiver on `POST /webhooks/linear` (HMAC `Linear-Signature`) and
  `GET /healthz`; bounces non-conforming issues out of `Ready for Claude`.
  Env: `LINEAR_API_KEY`, `LINEAR_WEBHOOK_SECRET`, `PAPEROS_BOT_ACTOR_IDS`,
  `PAPEROS_JUSTIN_ACTOR_ID`, `PAPEROS_CONTRACT_DB`, `PAPEROS_CONTRACT_MODE`, `PORT`.
* **Module API** (`src/contract/index.ts`): `validateIssue`, `parseSections`,
  `parseFilesGlobs`, `isOpen` (PAP-96 promotion imports it), `toContractIssue`,
  `fetchTeamIssues`, `renderViolationsComment`, `renderAuditTable`,
  `ContractCheckStore` (`contract_checks` DDL). Consumers: PAP-96, PAP-99,
  PAP-118, PAP-306, PAP-307.
* **API**: reads issues (with `inverseRelations`, `children`, `labels`,
  `attachments`) over Linear GraphQL, 100 per page; writes `issueUpdate`,
  `issueAddLabel`, `commentCreate` from the webhook path only.
## PAP-281: the orchestrator claim loop

* **CLI**: `pnpm orchestrator:loop [--apply] [--watch]` —
  `src/cli/loop.ts`. Without `--apply` it is read-only: it polls
  `Ready for Claude` on team PAP and prints the queue with a `claimable` or
  `skip (<reason>)` verdict per issue, writing nothing. `--apply` runs one
  cycle (claim up to `maxParallel`, launch, run registered passes);
  `--watch` keeps cycling at `pollIntervalMs` and serves the HTTP endpoints.
  Exit 0 ran, 2 Linear unreachable.
* **CLI**: `pnpm orchestrator:status [--json]` — `src/cli/status.ts`. Prints
  the claims and sessions the loop currently holds, plus whether PAP-93's
  validator is available. Never calls Linear, so it is safe against a live
  deployment. Exit 0 printed, 2 the database could not be opened.
* **HTTP API**: `GET /healthz` → `{ ok, at }`; `GET /status` →
  `StatusPayload` (mode, team, uptime, slots, claims, sessions, registered
  passes, validator availability, last 20 events). `src/http.ts`, bound to
  `http.host`/`http.port` from `orchestrator.config.yaml`
  (`127.0.0.1:8787` by default). Read-only; `POST` answers 405. PAP-283
  deploys it, PAP-113 renders it.
* **API (outbound)**: Linear GraphQL — `issues` (poll), `issue` (pre-claim
  re-read), `issueUpdate` (claim and transitions), `commentCreate`
  (`linearComment`), `attachmentLinkURL` (PR attachment, `pr-flow` only),
  `issueLabelCreate` (`retry-<n>`). No deletes, no archives, no renames, and
  no path to `Done`.
* **Module API**: `claimNext(deps, character?)`, `release`,
  `recoverClaims`, `toInReview`, `retry`, `escalate`, `linearComment`,
  `createLoop().registerPass(name, fn)`, the `SessionLauncher` port with
  `DryRunLauncher`, the typed `EventBus`
  (`issue.claimed | issue.released | issue.promoted | issue.escalated |
  issue.retried | issue.in_review | session.started | session.ended |
  pr.detected | loop.error | loop.cycle`), and the tables `sessions`,
  `claims`, `events`, `comments_sent`, `promotions`, `retries`.
* **MCP**: none added by this issue.
## PAP-94 Needs Justin queue (CLI + library)

| Ability | Surface | Command / call | Notes |
|---|---|---|---|
| List the queue | CLI | `pnpm justin:queue list` | Read-only over the live team: every issue in `Needs Justin`, the decision card parsed from its description or comments, open asks, age against the 48 h default window, and any reply from an authorised author. Queries only, no mutation. Needs the sandbox proxy env (`NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt`), like every Linear script here. |
| Audit the invariants | CLI | `pnpm justin:queue list --check` | Adds the invariants: at most `maxOpen` (5) open cards, no two cards sharing a `key`, every card carrying a `paperos-card` block, nothing silently past its window. Exit 1 on an error, 0 with warnings. |
| Machine-readable queue | CLI | `pnpm justin:queue list --json` | Same rows plus errors/warnings as JSON; the input the 14:00 UTC digest will render. |
| Propose a decision card | Library | `requestDecision(card, queue, now)` / `admit()` in `src/justin-queue/` | Returns `admitted` \| `queued` (cap, `queued-for-justin`) \| `deduped` (same `key`) \| `refused` (`NOT_A_HUMAN_DECISION`, `BELOW_SPEND_THRESHOLD`, `TOO_MANY_ASKS`, `NO_DEFAULT`, `INVALID_CARD`). Pure; the Linear writes are PAP-96's. |
| Free a slot | Library | `admitNext(queue)`, `slotsUsed(queue)` | Admits waiting cards by priority then age, up to the cap. |
| Parse Justin's reply | Library | `parseReply(text, { author })`, `decisionFromStateChange(state)` | `/approve`, `/approve option <n>`, `/reject <reason>`, `/option <n>`, `/defer <n>d`, `/ask: <q>`, `PAP-25: approve` pairs and `NJ-2.3: approve` per-ask answers; regex plus a one-typo budget, authorised authors only. |
| Apply a reply | Library | `applyReply(entry, reply, now)` | New queue entry, acknowledgement text and the Linear state to move to. Pure. |
| Silence handling | Library | `defaults(queue, now)`, `applyDefault()`, `defaultAppliesAt(card)` | `apply-default` after 48 h, `hold` for a hard block (never auto-applies), `wait` with the nudge flag. |
| Card schema and rendering | Library | `DecisionCardSchema` (Zod), `renderCard(card)`, `parseCardBlock(comment)` | `templates/needs-justin-card.md` plus the fenced `paperos-card` block that reads back. Policy: `docs/pm/justin-queue.md`. |

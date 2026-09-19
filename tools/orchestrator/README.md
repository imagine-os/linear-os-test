# paperos-orchestrator

The PaperOS build-loop orchestrator: Linear workspace-as-code, the
claim/promote loop, and the plumbing that spawns a builder session per
claimed issue.

Team PAP on Linear (https://linear.app/paperos) is the system of record for
the plan; this repo turns its configuration and its claim loop into code so
`paperos create <app>` gets the same pipeline every time.

## Layout

```
ops/linear/configure-workspace.ts   PAP-91: `pnpm linear:configure --check|--apply`
src/linear/                         Linear API client, diff engine, WorkspaceIds type
src/cli/                            CLI surface (pnpm linear:promote, contract:audit, paperos create) — stub, PAP-96/22/93
src/db/                             Orchestrator persistence (contract_checks, claim state) — stub, PAP-93/96
src/session/                        Builder-session spawning, Character routing — stub, PAP-96/99
src/loop.ts                         The promotion + claim loop entrypoint — stub, PAP-96
tests/                              Vitest unit/integration tests, fixtures/ for live-snapshot-shaped data
docs/pm/                            Pipeline docs (linear-setup.md, session-playbook.md from PAP-92)
docs/changelog/unreleased/          One `PAP-<n>.md` fragment per issue; never edit CHANGELOG.md directly
linear-workspace.json               Committed snapshot of every Linear id (states, labels, templates, projects, cycles)
```

`docs/pm/session-playbook.md`, `templates/` and `src/agents/` are added by
PAP-92; this issue (PAP-91) leaves those paths alone.

## Commands

```bash
pnpm install
pnpm check              # lint + typecheck + test — must be green before every push
pnpm lint / lint:fix     # Biome
pnpm typecheck           # tsc --noEmit
pnpm test / test:watch   # Vitest

pnpm linear:configure --check              # print drift against the plan, exit 1 if any
pnpm linear:configure --apply              # create/update what's missing, re-check, write linear-workspace.json
pnpm linear:configure --check --team OTHER # target a different team (refuses PAP-only assumptions otherwise)
```

`LINEAR_API_KEY` must be set (the PaperOS proxy injects the real value; any
placeholder string is fine locally). The `Authorization` header carries the
key with **no** `Bearer` prefix.

## Toolchain

Node 22 (see `.nvmrc`), pnpm 10, TypeScript 5 in strict mode, Biome 2 for
lint + format, Vitest 3 for tests, `tsx` to run TypeScript scripts directly
(no build step for `ops/`).

## Workspace-configuration script (PAP-91)

`ops/linear/configure-workspace.ts` is a pure diff-then-apply script:

1. Fetches the live team-PAP snapshot (states, labels, templates, team
   settings, projects, cycles) over the Linear GraphQL API.
2. Diffs it against the desired configuration in `src/linear/desired.ts`
   (today: the nine `Character/*` labels, six round-4 labels, and the
   `PaperOS Spec` template body).
3. `--check` prints a `(kind, name, field, live, wanted, status)` table and
   exits 1 if there's drift, 0 if there's none.
4. `--apply` creates/updates only what's missing, re-runs the check, and
   writes `linear-workspace.json`.

The diff engine (`src/linear/diff.ts`) can only ever emit
`issueLabelCreate`, `issueLabelUpdate` (parent only), `templateUpdate`,
`workflowStateUpdate` (description/color only) or `teamUpdate` — there is no
delete/archive/rename code path, so "zero destructive operations" holds by
construction and is asserted in `tests/diff.test.ts` and `tests/apply.test.ts`.
See `docs/pm/linear-setup.md` for what the live workspace already has and
why it stays that way.

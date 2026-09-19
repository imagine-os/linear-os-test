# paperos-orchestrator: brief for a Claude Code session

This is the PaperOS build-loop orchestrator (`imagine-os/paperos-orchestrator`,
mapped locally as `paperos-orchestrator` — plan name — by the build loop).
Linear team **PAP** (https://linear.app/paperos) is the system of record for
what to build; this repo is where the pipeline itself (workspace
configuration, the claim/promote loop, builder-session plumbing) lives as
code, plus the pm docs that describe it.

The sibling plan-mirror repo `linear-builder` (read-only from here) holds
every issue's spec under `specs/<project>/`; the current issue's spec is
always the source of truth for product content, Linear itself wins over the
spec file if they disagree.

## Folder map

| Path | Owner issue | Purpose |
|---|---|---|
| `ops/linear/configure-workspace.ts` | PAP-91 | `pnpm linear:configure --check\|--apply`: Linear-workspace-as-code |
| `src/linear/` | PAP-91 (+ consumers) | Linear GraphQL client, diff engine, `WorkspaceIds` type, desired config |
| `src/cli/` | PAP-96 / PAP-22 / PAP-93 | CLI surface: `linear:promote`, `contract:audit`, `paperos create` |
| `src/db/` | PAP-93 / PAP-96 | Orchestrator persistence: `contract_checks`, claim/session state |
| `src/session/` | PAP-96 / PAP-99 | Spawns a builder session per claimed issue; Character routing |
| `src/loop.ts` | PAP-96 | The promotion + claim loop entrypoint |
| `docs/pm/` | PAP-91 (`linear-setup.md`), PAP-92 (`session-playbook.md`) | Pipeline documentation |
| `docs/changelog/unreleased/PAP-<n>.md` | every issue | Append-only changelog fragments; never edit `CHANGELOG.md` by hand |
| `linear-workspace.json` | PAP-91, rewritten by `--apply` | Every id (states, labels, templates, projects, cycles) downstream code imports |
| `.github/workflows/ci.yml` | PAP-91 (wave 0) | `pnpm check` on push/PR |

`templates/` and `src/agents/` belong to PAP-92 — do not create or edit them
from another issue's session.

## Commands

```bash
pnpm install
pnpm check                      # lint + typecheck + test — green before every push
pnpm linear:configure --check   # drift table, exits 1 if any
pnpm linear:configure --apply   # apply + re-check + write linear-workspace.json
```

## Rules this repo's sessions follow (from the build-loop brief)

* **Never destructive in Linear.** No mutation this repo issues may delete,
  archive, rename an existing label/state, or change a state's type. The
  diff engine's `DiffOp` union structurally has no such variant; keep it
  that way, and keep the "zero destructive operations" test in
  `tests/diff.test.ts` passing when you extend it.
* **Treat the live workspace as correct** except for the specific additions
  a spec names. Don't "fix" existing states, labels, or team settings that
  already work; report drift, don't silently reconcile things nobody asked
  for.
* **One source of truth per id.** Downstream code imports ids from
  `linear-workspace.json` / `src/linear/workspace.ts::WorkspaceIds`, never
  hardcodes a Linear UUID inline.
* **Root files** (`package.json`, `tsconfig*.json`, `biome.json`,
  `vitest.config.ts`, `README.md`, `CLAUDE.md`, `.github/workflows/ci.yml`)
  were scaffolded by PAP-91 as this repo's wave-0 issue. Treat a root change
  from a later issue as a follow-up to call out, not a silent edit, unless
  your spec explicitly owns one of these files.
* **Changelog fragments**, not `CHANGELOG.md` edits: add
  `docs/changelog/unreleased/PAP-<n>.md` (2-6 lines: what landed, paths
  touched, ADR if any).
* **Commits**: Conventional Commits scoped by issue, e.g.
  `feat(PAP-91): linear workspace configuration as code`.

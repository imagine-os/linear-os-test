## PAP-91: Linear workspace configuration as code

Scaffolded `paperos-orchestrator` (pnpm, Node 22, TypeScript strict, Biome 2,
Vitest 3) and added `ops/linear/configure-workspace.ts`
(`pnpm linear:configure --check|--apply`): a diff-then-apply script that
adds the `Character` label group (9 children), the round-4 amendment labels
(`gates-pending`, `stuck`, `slack-risk`, `critical-path`, `source:slack`,
`triaged`), and fixes the `PaperOS Spec` template body to the eleven-section
issue contract, while treating the rest of the live team-PAP configuration
as correct. Zero destructive operations are possible by construction
(`src/linear/diff.ts`/`apply.ts`), asserted in tests.

Paths: `ops/linear/`, `src/linear/`, `src/cli/`, `src/db/`, `src/session/`,
`src/loop.ts`, `linear-workspace.json`, `docs/pm/linear-setup.md`,
`docs/reference/surfaces.md`, `tests/`, root scaffold files.
- Review pass (PAP-91): corrected `docs/pm/linear-setup.md` — the four surface labels are live
  children of the `Surface` group (`linear-workspace.json` already keys them `Surface/*`), not
  ungrouped; documented the `NODE_USE_ENV_PROXY=1` requirement for running `--check` in an agent
  sandbox.

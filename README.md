# linear-os-test: the PaperOS monorepo

[![ci](https://github.com/imagine-os/linear-os-test/actions/workflows/ci.yml/badge.svg)](https://github.com/imagine-os/linear-os-test/actions/workflows/ci.yml)
[![pages](https://github.com/imagine-os/linear-os-test/actions/workflows/pages.yml/badge.svg)](https://github.com/imagine-os/linear-os-test/actions/workflows/pages.yml)

Everything PaperOS in one repository since 2026-09-19:

| Path | Was | What |
| -- | -- | -- |
| `/` (root) | `imagine-os/empty-11` (paperos-template) | the platform monorepo: apps, packages, contracts, specs |
| `tools/orchestrator` | `imagine-os/empty12` (paperos-orchestrator) | build-loop orchestrator, a workspace package |
| `docs/plan` | `imagine-os/linear-builder` | plan, specs mirror, Blueprint site, build log, prompts, decisions |
| `site/hub` | new | GitHub Pages hub: https://imagine-os.github.io/linear-os-test/ (Blueprint at `/blueprint/`, web app at `/app/`) |

## paperos-template (root)

The monorepo every PaperOS app is cloned from: pnpm 10 workspaces, Turborepo 2, strict TypeScript
5.9, Biome 2, Vitest 3, and a Vite 7 + React 19 web shell.

```bash
pnpm i          # Node 22, pnpm 10 (see .nvmrc)
pnpm check      # lint + typecheck + test + build — the whole gate
pnpm dev        # apps/web on http://localhost:5173
```

## Layout

```
apps/web            Vite + React 19 shell (placeholder route today)
apps/desktop        Tauri shell            (stub, PAP-19)
apps/mobile         mobile shell           (stub, PAP-20)
apps/api            oRPC API process       (stub, PAP-267)
packages/core       contract-zero primitives, no React, no database
packages/ui         design-system components
packages/spec       page and app specs
packages/views      view model and compiler
packages/agents     character schema and agent ports
packages/contracts  @paperos/contract-<module>, one folder per module
packages/kernel     registry, DI, gateway, slots   (stub, PAP-434)
packages/config-ts  shared tsconfig presets
packages/config-biome  shared Biome preset
docs/               ADRs, changelog fragments, platform reference, surfaces, evidence
ops/                compose stacks and CI helpers
specs/  spikes/  .claude/
```

Start with [`CLAUDE.md`](CLAUDE.md) for the working rules and [`docs/README.md`](docs/README.md)
for the documentation map. Architecture decisions: [`docs/adr/`](docs/adr/README.md).

## Environment

| Variable | Used by | Default |
| -- | -- | -- |
| `BASE_PATH` | Vite `base` (GitHub Pages sub-path) | `/` |
| `VITE_GIT_SHA` | commit stamped into the bundle | `git rev-parse --short HEAD` |

Copy `.env.example` to `.env` for local overrides; `.env` is git-ignored.

## License

Placeholder, all rights reserved — see [`LICENSE`](LICENSE).

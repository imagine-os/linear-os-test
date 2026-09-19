### Changed — consolidation 2026-09-19: one repository, `imagine-os/linear-os-test`, with a Pages hub

- `paperos-template` (`empty-11`), `paperos-orchestrator` (`empty12`, now `tools/orchestrator` as a
  workspace package) and the plan (`linear-builder`, now `docs/plan/`) merged into this repository
  with their history; the 25 parked `feat/*` branches came along unchanged.
- GitHub Pages published by Actions: hub at https://imagine-os.github.io/linear-os-test/ (role
  switcher, dev mode, demo simulator, EN/ES toggle, all behind the not-wired badge), Blueprint at
  `/blueprint/`, `apps/web` at `/app/`.
- Paths: `pnpm-workspace.yaml`, `tools/orchestrator/`, `docs/plan/`, `site/hub/index.html`,
  `.github/workflows/pages.yml`. Decision: `docs/plan/docs/decisions/0005-one-repository-linear-os-test.md`.

### Fixed — web placeholder screen 2026-09-20: `/app/` no longer looks empty

- Justin reported https://imagine-os.github.io/linear-os-test/app/ "doesn't show anything". The
  bundle and base path were fine; the placeholder route rendered only "PaperOS template" and a
  commit SHA. `apps/web` now renders an honest placeholder screen: product name, one-line
  description, links to the Blueprint, hub, repository, build log and docs map, the build SHA, and
  the shell controls declared but not wired (dashed, badged, tooltip, "not wired yet" toast).
- English and Spanish from one catalog (`apps/web/src/messages.ts`, toggle sets `<html lang>`);
  actions registry `apps/web/src/actions.ts` (`shell.*`, rows in `docs/reference/surfaces.md`);
  styles on `@paperos/tokens/tokens.css` (new `apps/web -> packages/tokens` edge, dependency map
  regenerated). Tests: `App.test.tsx`, `actions.test.ts`, `messages.test.ts`.
- Paths: `apps/web/src/`, `apps/web/README.md`, `apps/web/package.json`, `pnpm-lock.yaml`,
  `docs/platform/dependency-map.*`, `docs/reference/surfaces.md`,
  `docs/evidence/web-placeholder-2026-09-20/`.

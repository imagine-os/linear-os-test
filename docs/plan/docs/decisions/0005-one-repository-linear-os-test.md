# 0005: One repository: `imagine-os/linear-os-test`

## Status

Accepted, 2026-09-19 19:57 UTC, by Justin Massion ("linear-os-test is the repo i made it has actions set for pages. Please move everything to that as a mono repo"; `../prompts/build-2026-09-19.md`). Carried out 20:00-20:27 UTC by the coordinating session (Claude Fable 5.1). Supersedes the one-repository and Pages *proposals* in the 19:18 section of `../build-log/2026-09-19.md` (the `paperos-core` name was not taken up; Justin named the repository) and the *Revert* clause of decision 0004 that anticipated a consolidation.

## Context

1. **Three repositories for one product.** Decision 0001 mapped the plan's repo table onto `imagine-os/empty-11` (`paperos-template`), `imagine-os/empty12` (`paperos-orchestrator`) and left the plan, specs and build log in `imagine-os/linear-builder`. That table predates the module system, which already puts every module in one workspace, and every pass since kickoff has had to write the same facts into three places.
2. **Pages confusion.** `empty-11` had Pages switched on with the branch source, which serves the Jekyll-rendered README and cannot build Vite; the only app deploy workflow (PAP-15) sat on an unmerged branch; the Blueprint was published from `linear-builder`; `empty12` had nothing to publish. Justin was handed two URLs on 19:59, one of which showed a README.
3. **Justin's 03:19 question**, unanswered for sixteen hours: "why don't you combine it all-in-one repo? And then tell me what to rename it. And how to connect the github pages as action or by pointing it to the proper branch". At 19:57 he answered it himself by creating `linear-os-test` with the Actions source already set, and asked for everything to move there, for links, and for the old repositories to be emptied or flagged for deletion.

## Decision

* **`imagine-os/linear-os-test` is the one PaperOS repository.** Layout: the platform monorepo (`apps/`, `packages/`, `docs/`, `ops/`, `specs/`, `spikes/`) at the root; the orchestrator at `tools/orchestrator` as a pnpm workspace package (`tools/*` in `pnpm-workspace.yaml`, catalog versions, root Vitest projects); the plan at `docs/plan` (its `CLAUDE.md` renamed `AGENT-BRIEF.md`, its own `.github/` dropped); the Pages hub at `site/hub`.
* **History is kept.** Each repository was moved in with its history and merged (`9624ede`/`66b6072` orchestrator, `adf1dbe`/`176ef20` plan) on top of `empty-11` `main` `d14f76c2` plus `fix/main-green-2026-09-19` `280e1453`. The 25 parked `feat/*` branches were pushed unchanged.
* **The template is a generator, not a fork target.** Nobody clones `linear-os-test` to start an app; the golden path (`docs/plan/docs/new-app-in-ten-minutes.md`) becomes a command inside this repository. Until it exists the root README says so.
* **Pages is published by GitHub Actions** from `.github/workflows/pages.yml`: hub at `/`, Blueprint (`docs/plan/site`) at `/blueprint/`, `apps/web` built with `BASE_PATH=/linear-os-test/app/` at `/app/`. This replaces the unmerged PAP-15 workflow and `linear-builder`'s own Pages workflow. The branch source is not used anywhere.
* **The old repositories are retired, not emptied.** `empty-11`, `empty12` and `linear-builder` are superseded and untouched; sessions cannot archive or delete repositories, so Justin does it when ready. `imagine-os/paperos` is a different product and is not part of this.
* **Follow-up, not in this pass:** the orchestrator config still names `paperos-template` / `paperos-orchestrator` (its config test asserts them); rename to the `linear-os-test` paths in a later pass. Historical mentions of the three old names in the build log, decisions, specs and orchestrator fixtures stay as written.
* **CI is dispatched by hand until push-triggered runs fire.** Push events under the `claude` GitHub identity produced no workflow runs in this repository and the Actions permissions endpoint is unreadable through the proxy; `workflow_dispatch` works, so each landing on `main` gets a dispatched `ci` (and `pages`) run until the cause is found.

## Consequences

* One URL family for everything Justin uses: https://imagine-os.github.io/linear-os-test/ (hub), `/blueprint/`, `/app/`. The 19:59 links to `linear-builder` and `empty-11` Pages are historical.
* One `main`, one merge queue, one CI. The parked branches from `empty-11` drain into this repository under decisions 0002-0004 unchanged; the "first-ever CI run per landing" warning from the 19:18 section still applies.
* The orchestrator is part of the root gate: `turbo lint typecheck test build` covers it (51 tasks), `pnpm --filter paperos-orchestrator check` still works on its own.
* Every doc path in earlier sections and decisions that said `linear-builder` now means `docs/plan/`; `docs/plan/docs/README.md` and the root `README.md` carry the mapping so old references stay readable.
* Decision 0001's repo mapping is historical from 20:07 UTC. Builder briefs that name `empty-11` or `empty12` need a v1.4 before the next wave.
* The hub page's controls (role switcher, dev mode, demo simulator, EN/ES) are placeholders behind the not-wired badge until their PAP issues land.

## Revert

Splitting back out is a `git subtree split` per path plus a repository per split; nothing in the layout prevents it. If Justin renames `linear-os-test`, GitHub redirects the old name and only `BASE_PATH` in `pages.yml` and the URLs in the docs change.

## Alternatives rejected

* **Keep three repositories.** Rejected: Justin asked for one; the split cost every pass duplicate docs, two Pages sites and a cross-repo merge queue, and gave nothing back once the module system put all modules in one workspace.
* **Rename `empty-11` in place (the 19:59 `paperos-core` proposal) and import the other two.** Rejected: Justin had already created `linear-os-test` with the Pages source set and named it as the target; renaming a second repository would have left two candidates. The layout proposed at 19:59 was kept, the name was not.
* **Publish Pages from a `gh-pages` branch.** Rejected: the branch source runs Jekyll and cannot build Vite, which is exactly what left `empty-11` serving its README; a build step is needed and Actions is the source Justin set. A committed `gh-pages` branch would also put build output under version control.
* **Mass-rewrite every old repository name in the docs.** Rejected: the build log, decisions and prompts are records of what happened when those were the names; the orchestrator fixtures embed the names as test data. A mapping in the entry-point READMEs is enough.

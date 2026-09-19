/**
 * CLI surface for the orchestrator.
 *
 * * `pnpm linear:configure` — PAP-91, `ops/linear/configure-workspace.ts`
 * * `pnpm orchestrator:status` — PAP-281, `src/cli/status.ts`
 * * `pnpm orchestrator:loop` — PAP-281, `src/cli/loop.ts`
 * * `pnpm linear:promote` — PAP-691 (promotion pass)
 * * `pnpm contract:audit` — PAP-93 (`src/cli/contract-audit.ts`)
 * * `paperos create <app>` — PAP-22
 */

export { main as statusMain } from "./status.js";

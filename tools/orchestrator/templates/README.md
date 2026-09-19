# Comment templates (PAP-92)

Rendered by sessions (and later by PAP-105 `linear-update`) with `{{name}}` placeholders; every template ends with the fenced `paperos-session` footer validated by `src/agents/session-footer.schema.json`. See `docs/pm/session-playbook.md` §6.

| File | Footer `status` | Placeholders |
|---|---|---|
| `session-started.md` | `started` | `repo`, `worktree`, `branch`, `characterLine`, `model`, `baseBranchesLine` (empty or ` Base branches merged: feat/PAP-x, ...`), `readList`, `plan`, `footer` |
| `session-progress.md` | `progress`, also `partial`, `contract-failed`, `handoff` | `elapsed`, `done`, `next`, `blockers`, `justinAck` (empty or ` Ack: <Justin's comment>`), `footer` |
| `session-ended.md` | `ended` | `integration` (`PR <url>` in target mode; `commits <sha...> on main of <remote>` in build-loop mode), `paths`, `checks`, `evidence`, `deviations`, `needsJustin`, `costUsd`, `turns`, `footer` |
| `promoted.md` | `promoted` (posted by PAP-96, not by sessions) | `blockersLine` (`blockers PAP-x (Done), PAP-y (In Review, branch feat/PAP-y)` or `no blockers`), `footer` |
| `needs-justin-card.md` (PAP-94) | — (its own fenced `paperos-card` block, not a session footer) | rendered by `renderCard()` in `src/justin-queue/render.ts`, never by hand; see `docs/pm/justin-queue.md` |

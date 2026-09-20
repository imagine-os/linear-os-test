# @paperos/web

The PaperOS web shell. Today it renders one placeholder screen; PAP-16 adds the router,
PAP-18 the PWA layer. It is published at https://imagine-os.github.io/linear-os-test/app/ by
`.github/workflows/pages.yml` (built with `BASE_PATH=/linear-os-test/app/`).

```bash
pnpm dev            # http://localhost:5173
pnpm --filter @paperos/web build
```

Build-time env: `BASE_PATH` (Vite `base`, GitHub Pages sub-path) and `VITE_GIT_SHA`
(stamped into the bundle; falls back to `git rev-parse --short HEAD`).

## The placeholder screen (`src/App.tsx`)

Honest about what exists: product name, one-line description, links to the Blueprint, the hub,
the repository, the build log and the docs map, the build SHA, and the shell controls that are
declared but not implemented. Landmarks: `banner`, `main` (two labelled sections), `contentinfo`.

| File | Holds |
| -- | -- |
| `src/messages.ts` | the message catalog, `en` and `es`, every user-visible string; `t(locale, key, slots)` |
| `src/actions.ts` | the page's actions registry (`WEB_SHELL_ACTIONS`), in the `ActionDeclaration` shape of `packages/input`; `PLACEHOLDER_ACTIONS` drives the rendered controls |
| `src/links.ts` | link targets; hub and Blueprint paths derive from Vite's `BASE_URL` so they work locally and on Pages |
| `src/styles.css` | layout on top of `@paperos/tokens/tokens.css` (`--pos-*` colours, type, spacing, radii, motion) |

Standards met: fluid type from 360 to 3840 px (token scale plus a `clamp()` headline), 44 px
targets (`--pos-size-target-min`), always-visible focus rings, `prefers-reduced-motion`, light and
dark from the tokens, no hover-only behaviour, EN/ES toggle that also sets `<html lang>`.

Placeholders: every control with `placeholder: true` renders with a dashed border, a visible
"not wired yet" badge, a `title` tooltip and `aria-describedby`; activating it shows a
"not wired yet" toast (`role="status"`, dismiss button, auto-clears after six seconds). There is no
dev-mode toggle yet, so the marking is always visible.

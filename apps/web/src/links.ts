/**
 * The places the placeholder screen links to.
 *
 * The hub and the Blueprint are published next to this app by
 * `.github/workflows/pages.yml` (`/`, `/blueprint/`, `/app/`), so their paths are
 * derived from Vite's `BASE_URL` rather than hard-coded: locally (`base: '/'`)
 * they resolve to the dev origin, on Pages to `/linear-os-test/`.
 */

export const REPO_URL = 'https://github.com/imagine-os/linear-os-test';

/** Root of the published site: `BASE_URL` minus the trailing `app/` segment. */
export function siteRoot(baseUrl: string = import.meta.env.BASE_URL): string {
  return baseUrl.endsWith('app/') ? baseUrl.slice(0, -'app/'.length) : baseUrl;
}

export function links(baseUrl: string = import.meta.env.BASE_URL) {
  const root = siteRoot(baseUrl);
  return {
    hub: root,
    blueprint: `${root}blueprint/`,
    repo: REPO_URL,
    buildLog: `${REPO_URL}/blob/main/docs/plan/docs/build-log/2026-09-19.md`,
    docs: `${REPO_URL}/blob/main/docs/README.md`,
  } as const;
}

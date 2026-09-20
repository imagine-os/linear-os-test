import { TEMPLATE_TITLE } from '@paperos/ui';
import { useEffect, useId, useState } from 'react';
import { type ActionDeclaration, PLACEHOLDER_ACTIONS, WEB_SHELL_ACTIONS } from './actions.js';
import { links } from './links.js';
import { DEFAULT_LOCALE, type Locale, type MessageKey, nextLocale, t } from './messages.js';

/**
 * Placeholder route. PAP-16 replaces it with the router and the real shell.
 *
 * Until then this screen is honest about what exists: it names the product, links
 * to the Blueprint, the repository, the build log and the docs map, and renders
 * the shell controls that are declared in the actions registry but not wired yet.
 * Activating one of those shows a "not wired yet" toast instead of failing
 * silently. Every user-visible string comes from `messages.ts` (English and
 * Spanish); every control is declared in `actions.ts`.
 */
export function App() {
  const gitSha = import.meta.env.VITE_GIT_SHA;
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [toast, setToast] = useState<string | null>(null);
  const hintId = useId();
  const m = (key: MessageKey, slots?: Record<string, string>) => t(locale, key, slots);
  const href = links();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    if (toast === null) return;
    const timer = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function activatePlaceholder(action: ActionDeclaration) {
    setToast(m('toastNotWired', { action: m(action.titleKey) }));
  }

  const resources: ReadonlyArray<{ id: string; url: string; label: MessageKey; hint: MessageKey }> =
    [
      {
        id: 'shell.openBlueprint',
        url: href.blueprint,
        label: 'linkBlueprint',
        hint: 'linkBlueprintHint',
      },
      { id: 'shell.openHub', url: href.hub, label: 'linkHub', hint: 'linkHubHint' },
      { id: 'shell.openRepository', url: href.repo, label: 'linkRepo', hint: 'linkRepoHint' },
      {
        id: 'shell.openBuildLog',
        url: href.buildLog,
        label: 'linkBuildLog',
        hint: 'linkBuildLogHint',
      },
      { id: 'shell.openDocs', url: href.docs, label: 'linkDocs', hint: 'linkDocsHint' },
    ];

  return (
    <div className="page" data-registry-owner={WEB_SHELL_ACTIONS.owner}>
      <header className="page__header">
        <p className="brand">
          <span className="brand__name">{m('brand')}</span>
          <span className="brand__template">{TEMPLATE_TITLE}</span>
        </p>
        <span className="badge badge--warning">{m('shellBadge')}</span>
        <button
          type="button"
          className="control"
          data-action-id="shell.toggleLocale"
          lang={nextLocale(locale)}
          aria-label={m('localeToggleLabel')}
          onClick={() => setLocale(nextLocale(locale))}
        >
          {m('localeToggle')}
        </button>
      </header>

      <main className="page__main">
        <h1 className="page__title">{m('headline')}</h1>
        <p className="page__lead">{m('description')}</p>

        <section className="section" aria-labelledby="exists-heading">
          <h2 id="exists-heading" className="section__title">
            {m('existsHeading')}
          </h2>
          <ul className="cards">
            {resources.map((r) => (
              <li key={r.id}>
                <a className="card" href={r.url} data-action-id={r.id}>
                  <span className="card__title">{m(r.label)}</span>
                  <span className="card__hint">{m(r.hint)}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="section" aria-labelledby="controls-heading">
          <h2 id="controls-heading" className="section__title">
            {m('placeholdersHeading')}
          </h2>
          <p id={hintId} className="section__note">
            {m('placeholdersNote')}
          </p>
          <div className="controls">
            {PLACEHOLDER_ACTIONS.map((action) => (
              <button
                key={action.id}
                type="button"
                className="control control--placeholder"
                data-action-id={action.id}
                data-placeholder="true"
                title={m('notWired')}
                aria-describedby={hintId}
                onClick={() => activatePlaceholder(action)}
              >
                <span>{m(action.titleKey)}</span>
                <span className="badge badge--small">{m('notWired')}</span>
              </button>
            ))}
          </div>
        </section>
      </main>

      <footer className="page__footer">
        <p className="page__build">
          <span>{m('buildLabel')}</span> <output className="page__sha">{gitSha}</output>
        </p>
        <p className="page__note">{m('footerNote')}</p>
      </footer>

      <div className="toast-region" aria-live="polite">
        {toast !== null && (
          <div className="toast" role="status">
            <span className="toast__text">{toast}</span>
            <button type="button" className="control control--ghost" onClick={() => setToast(null)}>
              {m('toastDismiss')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

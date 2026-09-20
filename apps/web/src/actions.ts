import type { MessageKey } from './messages.js';

/**
 * Actions registry for the placeholder route.
 *
 * Every page declares its actions; the declaration is the WebMCP surface and the
 * voice controller's vocabulary (`docs/reference/surfaces.md`, PAP-150). The
 * shape below mirrors `ActionDeclaration` in `packages/input/src/contract/action.ts`
 * field for field. It is copied rather than imported because `apps/web` may not
 * depend on `packages/input` until PAP-476 lifts the contract out as
 * `@paperos/contract-input` (`ownership.json`, rule R4). When that lands, this file
 * switches to `defineAction` and the local type goes away.
 *
 * A UI change that adds, renames or removes a control changes this file in the
 * same commit. `App.tsx` renders its controls from this list, so the two cannot
 * drift.
 */

export type ActionScope = 'global' | 'page' | 'component' | 'selection';

export interface ActionDeclaration {
  /** Dot-namespaced, stable, unique across the app. */
  readonly id: string;
  /** Message-catalog key, never a literal string. */
  readonly titleKey: MessageKey;
  readonly descriptionKey: MessageKey | null;
  /** Spoken phrases per locale; lower-case, unpunctuated. */
  readonly intent: { readonly en: readonly string[]; readonly es: readonly string[] };
  /** Permission the caller needs, or null for an always-available action. */
  readonly permission: string | null;
  readonly scope: ActionScope;
  readonly shortcut: null;
  readonly modalities: readonly never[];
  readonly agentCallable: boolean;
  /** Declared but not implemented: the UI shows "not wired yet". */
  readonly placeholder: boolean;
  readonly argsSchema: null;
}

export interface ActionRegistry {
  readonly contract: string;
  /** Page route or `app` for globals. */
  readonly owner: string;
  readonly actions: readonly ActionDeclaration[];
}

const base = {
  descriptionKey: null,
  scope: 'page',
  shortcut: null,
  modalities: [],
  agentCallable: false,
  argsSchema: null,
} as const satisfies Partial<ActionDeclaration>;

export const ACTION_ID_PATTERN = /^[a-z][a-z0-9]*(\.[a-z][a-zA-Z0-9]*)+$/;

export const WEB_SHELL_ACTIONS: ActionRegistry = {
  contract: '@paperos/input action-registry 0.1.0',
  owner: '/',
  actions: [
    {
      ...base,
      id: 'shell.toggleLocale',
      titleKey: 'localeToggle',
      intent: {
        en: ['switch language', 'switch to spanish', 'switch to english'],
        es: ['cambiar idioma', 'cambiar a español', 'cambiar a inglés'],
      },
      permission: null,
      scope: 'global',
      agentCallable: true,
      placeholder: false,
    },
    {
      ...base,
      id: 'shell.openBlueprint',
      titleKey: 'linkBlueprint',
      intent: { en: ['open the blueprint'], es: ['abrir el blueprint'] },
      permission: null,
      agentCallable: true,
      placeholder: false,
    },
    {
      ...base,
      id: 'shell.openHub',
      titleKey: 'linkHub',
      intent: { en: ['open the hub', 'go home'], es: ['abrir el hub', 'ir al inicio'] },
      permission: null,
      agentCallable: true,
      placeholder: false,
    },
    {
      ...base,
      id: 'shell.openRepository',
      titleKey: 'linkRepo',
      intent: { en: ['open the repository', 'open github'], es: ['abrir el repositorio'] },
      permission: null,
      agentCallable: true,
      placeholder: false,
    },
    {
      ...base,
      id: 'shell.openBuildLog',
      titleKey: 'linkBuildLog',
      intent: { en: ['open the build log'], es: ['abrir el registro de construcción'] },
      permission: null,
      agentCallable: true,
      placeholder: false,
    },
    {
      ...base,
      id: 'shell.openDocs',
      titleKey: 'linkDocs',
      intent: { en: ['open the docs', 'open the documentation'], es: ['abrir la documentación'] },
      permission: null,
      agentCallable: true,
      placeholder: false,
    },
    {
      ...base,
      id: 'shell.signIn',
      titleKey: 'actionSignIn',
      intent: { en: ['sign in', 'log in'], es: ['iniciar sesión', 'entrar'] },
      permission: null,
      scope: 'global',
      placeholder: true,
    },
    {
      ...base,
      id: 'shell.switchRole',
      titleKey: 'actionSwitchRole',
      intent: { en: ['switch role', 'view as {role}'], es: ['cambiar de rol', 'ver como {role}'] },
      permission: 'shell:switch-role',
      scope: 'global',
      placeholder: true,
    },
    {
      ...base,
      id: 'shell.toggleDevMode',
      titleKey: 'actionDevMode',
      intent: { en: ['toggle developer mode', 'developer mode'], es: ['modo desarrollador'] },
      permission: 'shell:dev-mode',
      scope: 'global',
      placeholder: true,
    },
    {
      ...base,
      id: 'shell.openCommandPalette',
      titleKey: 'actionCommandPalette',
      intent: { en: ['open the command palette', 'command palette'], es: ['paleta de comandos'] },
      permission: null,
      scope: 'global',
      placeholder: true,
    },
  ],
};

/** The declared-but-unimplemented controls the placeholder screen renders. */
export const PLACEHOLDER_ACTIONS = WEB_SHELL_ACTIONS.actions.filter((a) => a.placeholder);

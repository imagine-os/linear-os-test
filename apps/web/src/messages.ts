/**
 * Message catalog for the web shell's placeholder screen.
 *
 * English and Spanish ship together (org rule: no hard-coded user-visible
 * strings, Spanish is never a later pass). The real catalog and the locale
 * provider land with the router (PAP-16) and the design system; until then this
 * file is the one place a user-visible string may live in `apps/web`.
 */

export type Locale = 'en' | 'es';

export const LOCALES: readonly Locale[] = ['en', 'es'];

export const DEFAULT_LOCALE: Locale = 'en';

const en = {
  brand: 'PaperOS',
  shellBadge: 'App shell: not wired yet',
  headline: 'The PaperOS web shell',
  description:
    'This route is a placeholder until the router lands (PAP-16). The links below are real and point at what exists in the repository today.',
  existsHeading: 'What exists today',
  linkBlueprint: 'Blueprint',
  linkBlueprintHint: 'Vision, decisions, phases and the project index',
  linkHub: 'Hub',
  linkHubHint: 'Every published surface in one place',
  linkRepo: 'Repository on GitHub',
  linkRepoHint: 'Monorepo: apps, packages, contracts, docs and plan',
  linkBuildLog: 'Build log',
  linkBuildLogHint: 'What each session built, in order',
  linkDocs: 'Documentation map',
  linkDocsHint: 'docs/README.md, the start-here map',
  placeholdersHeading: 'Shell controls',
  placeholdersNote:
    'These controls are declared in the actions registry but not wired yet. Activating one says so instead of failing silently.',
  notWired: 'not wired yet',
  actionSignIn: 'Sign in',
  actionSwitchRole: 'Switch role',
  actionDevMode: 'Developer mode',
  actionCommandPalette: 'Command palette',
  toastNotWired:
    '{action} is not wired yet. It is declared in the actions registry and lands with the app shell.',
  toastDismiss: 'Dismiss',
  localeToggle: 'Español',
  localeToggleLabel: 'Cambiar el idioma a español',
  buildLabel: 'Build',
  footerNote: 'Published from imagine-os/linear-os-test by GitHub Pages.',
} as const;

export type MessageKey = keyof typeof en;

export type Messages = Readonly<Record<MessageKey, string>>;

const es: Messages = {
  brand: 'PaperOS',
  shellBadge: 'Shell de la app: aún sin conectar',
  headline: 'El shell web de PaperOS',
  description:
    'Esta ruta es un marcador de posición hasta que llegue el enrutador (PAP-16). Los enlaces de abajo son reales y apuntan a lo que existe hoy en el repositorio.',
  existsHeading: 'Lo que existe hoy',
  linkBlueprint: 'Blueprint',
  linkBlueprintHint: 'Visión, decisiones, fases e índice de proyectos',
  linkHub: 'Hub',
  linkHubHint: 'Todas las superficies publicadas en un solo lugar',
  linkRepo: 'Repositorio en GitHub',
  linkRepoHint: 'Monorepo: apps, paquetes, contratos, docs y plan',
  linkBuildLog: 'Registro de construcción',
  linkBuildLogHint: 'Qué construyó cada sesión, en orden',
  linkDocs: 'Mapa de documentación',
  linkDocsHint: 'docs/README.md, el punto de partida',
  placeholdersHeading: 'Controles del shell',
  placeholdersNote:
    'Estos controles están declarados en el registro de acciones pero aún no están conectados. Al activarlos lo dicen en lugar de fallar en silencio.',
  notWired: 'aún sin conectar',
  actionSignIn: 'Iniciar sesión',
  actionSwitchRole: 'Cambiar de rol',
  actionDevMode: 'Modo desarrollador',
  actionCommandPalette: 'Paleta de comandos',
  toastNotWired:
    '{action} aún no está conectado. Está declarado en el registro de acciones y llega con el shell de la app.',
  toastDismiss: 'Cerrar',
  localeToggle: 'English',
  localeToggleLabel: 'Switch the language to English',
  buildLabel: 'Compilación',
  footerNote: 'Publicado desde imagine-os/linear-os-test por GitHub Pages.',
};

export const messages: Readonly<Record<Locale, Messages>> = { en, es };

/** Look up a message and fill `{slot}` placeholders. */
export function t(locale: Locale, key: MessageKey, slots: Record<string, string> = {}): string {
  return messages[locale][key].replace(/\{(\w+)\}/g, (match, slot: string) => slots[slot] ?? match);
}

/** The other shipped locale, for the single toggle button. */
export function nextLocale(locale: Locale): Locale {
  return locale === 'en' ? 'es' : 'en';
}

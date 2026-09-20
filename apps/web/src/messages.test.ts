import { describe, expect, it } from 'vitest';
import { LOCALES, messages, nextLocale, t } from './messages.js';

describe('message catalog', () => {
  it('has the same keys in every locale', () => {
    const keys = Object.keys(messages.en).sort();
    for (const locale of LOCALES) expect(Object.keys(messages[locale]).sort()).toEqual(keys);
  });

  it('fills slots and leaves unknown slots visible', () => {
    expect(t('en', 'toastNotWired', { action: 'Sign in' })).toMatch(/^Sign in is not wired yet/);
    expect(t('es', 'toastNotWired', {})).toMatch(/^\{action\}/);
  });

  it('toggles between the two shipped locales', () => {
    expect(nextLocale('en')).toBe('es');
    expect(nextLocale('es')).toBe('en');
  });
});

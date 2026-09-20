import { describe, expect, it } from 'vitest';
import { ACTION_ID_PATTERN, PLACEHOLDER_ACTIONS, WEB_SHELL_ACTIONS } from './actions.js';
import { messages } from './messages.js';

describe('web shell actions registry', () => {
  it('declares dot-namespaced, unique ids', () => {
    const ids = WEB_SHELL_ACTIONS.actions.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(ACTION_ID_PATTERN);
  });

  it('carries English and Spanish intent phrases and a catalog title for every action', () => {
    for (const action of WEB_SHELL_ACTIONS.actions) {
      expect(action.intent.en.length).toBeGreaterThan(0);
      expect(action.intent.es.length).toBeGreaterThan(0);
      expect(messages.en[action.titleKey]).toBeTruthy();
      expect(messages.es[action.titleKey]).toBeTruthy();
    }
  });

  it('marks the unimplemented shell controls as placeholders', () => {
    expect(PLACEHOLDER_ACTIONS.map((a) => a.id)).toEqual([
      'shell.signIn',
      'shell.switchRole',
      'shell.toggleDevMode',
      'shell.openCommandPalette',
    ]);
  });
});

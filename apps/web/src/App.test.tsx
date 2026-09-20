import { PAPEROS_VERSION } from '@paperos/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App.js';
import { PLACEHOLDER_ACTIONS } from './actions.js';
import { messages } from './messages.js';

describe('placeholder route', () => {
  it('renders the headline inside a level-1 heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(messages.en.headline);
  });

  it('renders the build commit from VITE_GIT_SHA', () => {
    render(<App />);
    expect(screen.getByText(import.meta.env.VITE_GIT_SHA)).toBeInTheDocument();
  });

  it('exposes banner, main and contentinfo landmarks', () => {
    render(<App />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('links to the blueprint, the hub and the repository', () => {
    render(<App />);
    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('/blueprint/');
    expect(hrefs).toContain('/');
    expect(hrefs).toContain('https://github.com/imagine-os/linear-os-test');
  });

  it('renders one marked control per placeholder action and toasts on activation', () => {
    render(<App />);
    const controls = document.querySelectorAll('[data-placeholder="true"]');
    expect(controls).toHaveLength(PLACEHOLDER_ACTIONS.length);
    for (const control of controls) {
      expect(control).toHaveAttribute('title', messages.en.notWired);
      expect(control).toHaveAttribute('aria-describedby');
    }
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(screen.getByText(/Sign in is not wired yet/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: messages.en.toastDismiss }));
    expect(screen.queryByText(/Sign in is not wired yet/)).not.toBeInTheDocument();
  });

  it('toggles between English and Spanish and updates the document language', () => {
    render(<App />);
    expect(document.documentElement.lang).toBe('en');
    fireEvent.click(screen.getByRole('button', { name: messages.en.localeToggleLabel }));
    expect(document.documentElement.lang).toBe('es');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(messages.es.headline);
    fireEvent.click(screen.getByRole('button', { name: messages.es.localeToggleLabel }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(messages.en.headline);
  });

  it('resolves workspace packages through the @paperos/* alias', () => {
    expect(PAPEROS_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});

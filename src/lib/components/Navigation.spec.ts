/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Navigation from './Navigation.svelte';

// We need to mock $app/state or $app/stores
// Vitest with Svelte 5 is tricky with the new runes.
// For now, let's just verify it renders without crashing.

describe('Navigation Component', () => {
  it('should render navigation links', () => {
    render(Navigation);
    const generateLink = screen.getByText('Generate');
    const historyLink = screen.getByText('History');
    const favoritesLink = screen.getByText('Favorites');

    expect(generateLink).toBeTruthy();
    expect(historyLink).toBeTruthy();
    expect(favoritesLink).toBeTruthy();
  });
});

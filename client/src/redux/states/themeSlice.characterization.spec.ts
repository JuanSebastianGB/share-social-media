import { themeEmptyState } from '@/models';
import { describe, expect, it } from 'vitest';
import themeReducer, { toggleMode } from './themeSlice';

// Captured on: 2026-09-20 from feat/client-unit-tests
// Known bugs: none recorded

// characterization: documents current behavior, NOT intended spec
describe('themeSlice characterization', () => {
  it('toggleMode from light — switches mode to dark', () => {
    // Arrange
    const previous = { ...themeEmptyState, mode: 'light' as const };

    // Act
    const next = themeReducer(previous, toggleMode({ mode: 'light' }));

    // Assert
    expect(next.mode).toBe('dark');
  });

  it('toggleMode from dark — switches mode to light', () => {
    // Arrange
    const previous = { mode: 'dark' as const };

    // Act
    const next = themeReducer(previous, toggleMode({ mode: 'dark' }));

    // Assert
    expect(next.mode).toBe('light');
  });
});

import { describe, expect, it } from 'vitest';
import { makeTheme } from './themeConfig';

// Captured on: 2026-09-20 from feat/client-unit-tests
// Known bugs: none recorded

// characterization: documents current behavior, NOT intended spec
describe('makeTheme characterization', () => {
  it('light mode — sets documented primary and background palette values', () => {
    // Arrange / Act
    const theme = makeTheme('light');

    // Assert
    expect(theme.palette.primary.main).toBe('#dc2f02');
    expect(theme.palette.primary.light).toBe('#faa307');
    expect(theme.palette.primary.dark).toBe('#370617');
    expect(theme.palette.background.default).toBe('#e9ecef');
    expect(theme.palette.background.paper).toBe('#f8f9fa');
  });

  it('dark mode — sets documented primary and background palette values', () => {
    // Arrange / Act
    const theme = makeTheme('dark');

    // Assert
    expect(theme.palette.primary.main).toBe('#e85d04');
    expect(theme.palette.primary.light).toBe('#03071e');
    expect(theme.palette.primary.dark).toBe('#faa307');
    expect(theme.palette.background.default).toBe('#495057');
    expect(theme.palette.background.paper).toBe('#212529');
  });
});

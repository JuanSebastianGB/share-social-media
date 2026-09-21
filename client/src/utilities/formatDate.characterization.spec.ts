import { describe, expect, it } from 'vitest';
import { formatDate } from './formatDate';

// Captured on: 2026-09-20 from feat/client-unit-tests
// Known bug: formatDate uses local timezone date parts — output depends on the host timezone

// characterization: documents current behavior, NOT intended spec
describe('formatDate characterization', () => {
  it('known local Date string — formats with local day/month/year/hour/minute parts', () => {
    // Arrange — construct local Date so timezone does not skew expectations
    const localDate = new Date(2024, 0, 15, 14, 30);
    const isoLike = localDate.toString();
    const expected = `${localDate.getDate()} - ${localDate.getMonth() + 1} - ${localDate.getFullYear()} H: ${localDate.getHours()} ${localDate.getMinutes()}`;

    // Act
    const result = formatDate(isoLike);

    // Assert
    expect(result).toBe(expected);
  });

  it('ISO UTC string — formats using local date parts of the parsed Date', () => {
    // Arrange
    const iso = '2024-06-01T12:00:00.000Z';
    const parsed = new Date(iso);
    const expected = `${parsed.getDate()} - ${parsed.getMonth() + 1} - ${parsed.getFullYear()} H: ${parsed.getHours()} ${parsed.getMinutes()}`;

    // Act
    const result = formatDate(iso);

    // Assert
    expect(result).toBe(expected);
  });
});

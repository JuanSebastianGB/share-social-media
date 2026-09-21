import { describe, expect, it } from 'vitest';
import { postSchema } from './post.schema';

// Captured on: 2026-09-20 from feat/client-unit-tests
// Known bugs: none recorded
// Companion examples for post.schema.property.spec.ts

// characterization: documents current behavior, NOT intended spec
describe('postSchema characterization', () => {
  it('body length 10..50 with userId — isValid returns true', async () => {
    // Arrange
    const payload = {
      body: 'Hello world!',
      userId: 'user-1',
    };

    // Act
    const result = await postSchema.isValid(payload);

    // Assert
    expect(result).toBe(true);
  });

  it('body shorter than 10 — isValid returns false', async () => {
    // Arrange
    const payload = { body: 'short', userId: 'user-1' };

    // Act
    const result = await postSchema.isValid(payload);

    // Assert
    expect(result).toBe(false);
  });

  it('body longer than 50 — isValid returns false', async () => {
    // Arrange
    const payload = {
      body: 'x'.repeat(51),
      userId: 'user-1',
    };

    // Act
    const result = await postSchema.isValid(payload);

    // Assert
    expect(result).toBe(false);
  });

  it('missing userId — isValid returns false', async () => {
    // Arrange
    const payload = { body: 'Hello world!' };

    // Act
    const result = await postSchema.isValid(payload);

    // Assert
    expect(result).toBe(false);
  });
});

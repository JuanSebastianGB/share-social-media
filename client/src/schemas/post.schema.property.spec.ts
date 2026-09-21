import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { postSchema } from './post.schema';

/**
 * Companion examples: post.schema.characterization.spec.ts
 * Body rules: required string min 10 max 50; userId required non-empty string.
 */

describe('postSchema properties', () => {
  // Property: for any body length 10..50 and non-empty userId, isValid is true
  it('body length 10..50 with non-empty userId — isValid returns true', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 10, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 40 }),
        async (body, userId) => {
          const result = await postSchema.isValid({ body, userId });
          expect(result).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  // Property: for any body length < 10 with non-empty userId, isValid is false
  it('body length under 10 — isValid returns false', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 0, maxLength: 9 }),
        fc.string({ minLength: 1, maxLength: 40 }),
        async (body, userId) => {
          const result = await postSchema.isValid({ body, userId });
          expect(result).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });

  // Property: for any body length > 50 with non-empty userId, isValid is false
  it('body length over 50 — isValid returns false', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 51, maxLength: 80 }),
        fc.string({ minLength: 1, maxLength: 40 }),
        async (body, userId) => {
          const result = await postSchema.isValid({ body, userId });
          expect(result).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });
});

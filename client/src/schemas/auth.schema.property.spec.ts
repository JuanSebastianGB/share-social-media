import fc from 'fast-check';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Companion examples: auth.schema.characterization.spec.ts
 * Local-mode login password min is 3; Yup email — use clearly invalid shapes only.
 */

describe('auth.schema properties (local mode)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock('@/shared/lib/utilities/cognitoMode', () => ({
      isCognitoClientEnabled: () => false,
    }));
  });

  afterEach(() => {
    vi.doUnmock('@/shared/lib/utilities/cognitoMode');
    vi.resetModules();
  });

  // Property: for any clearly invalid email (no @), local-mode login isValid is false
  it('clearly invalid emails (no @) — login isValid returns false', async () => {
    const { loginSchema } = await import('./auth.schema');

    await fc.assert(
      fc.asyncProperty(
        fc
          .string({ minLength: 1, maxLength: 40 })
          .filter((s) => !s.includes('@') && s.trim().length > 0),
        fc.string({ minLength: 3, maxLength: 20 }),
        async (email, password) => {
          const result = await loginSchema.isValid({ email, password });
          expect(result).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });

  // Property: for any login password shorter than local min (3), isValid is false
  it('passwords shorter than local login min — login isValid returns false', async () => {
    const { loginSchema } = await import('./auth.schema');

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('a@b.co', 'user@example.com', 'x@y.z'),
        fc.string({ minLength: 0, maxLength: 2 }),
        async (email, password) => {
          const result = await loginSchema.isValid({ email, password });
          expect(result).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });
});

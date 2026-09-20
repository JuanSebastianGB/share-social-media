import * as fc from 'fast-check';
import { User } from './user.js';
import { InvalidUserError } from './errors.js';

const mongoIdArb = fc.stringMatching(/^[0-9a-f]{24}$/);
const nonBlankEmailLocalArb = fc
  .string({ minLength: 1, maxLength: 20 })
  .filter((value) => value.trim().length > 0)
  .map((value) => value.trim().replace(/\s+/g, ''));
const emailArb = nonBlankEmailLocalArb.map(
  (local) => `${local.toLowerCase()}@example.com`,
);

describe('User aggregate properties', () => {
  // Property: create then reconstitute round-trips identity fields
  test('create round-trips via reconstitute', () => {
    fc.assert(
      fc.property(mongoIdArb, emailArb, (id, email) => {
        const user = User.create({
          id,
          email,
          now: '2026-01-01T00:00:00.000Z',
        });
        const snapshot = user.toSnapshot();
        expect(User.reconstitute(snapshot).toSnapshot()).toEqual(snapshot);
      }),
      { numRuns: 100 },
    );
  });

  // Property: toSnapshot and reconstitute always copy the friends array
  test('friends array is copied on toSnapshot and reconstitute', () => {
    fc.assert(
      fc.property(
        mongoIdArb,
        fc.uniqueArray(mongoIdArb, { minLength: 0, maxLength: 5 }),
        (id, friends) => {
          const filtered = friends.filter((friendId) => friendId !== id);
          const user = User.reconstitute({
            id,
            email: 'copy@example.com',
            role: 'user',
            friends: filtered,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          });
          const snapshot = user.toSnapshot();
          snapshot.friends.push('mutated');
          expect(user.toSnapshot().friends).toEqual(filtered);
        },
      ),
      { numRuns: 100 },
    );
  });

  // Property: blank emails always reject
  test('blank emails always throw InvalidUserError', () => {
    fc.assert(
      fc.property(
        mongoIdArb,
        fc.constantFrom('', ' ', '   ', '\t', '\n'),
        (id, blank) => {
          expect(() => User.create({ id, email: blank })).toThrow(
            InvalidUserError,
          );
        },
      ),
      { numRuns: 50 },
    );
  });

  // Property: create always stores trimmed lowercase email
  test('create always stores normalized email', () => {
    fc.assert(
      fc.property(
        mongoIdArb,
        nonBlankEmailLocalArb,
        (id, local) => {
          const raw = `  ${local}@Example.COM  `;
          const user = User.create({
            id,
            email: raw,
            now: '2026-01-01T00:00:00.000Z',
          });
          expect(user.toSnapshot().email).toBe(
            raw.trim().toLowerCase(),
          );
        },
      ),
      { numRuns: 100 },
    );
  });
});

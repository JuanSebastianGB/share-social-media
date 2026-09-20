import * as fc from 'fast-check';
import { Comment } from './comment.js';
import { InvalidCommentError } from './errors.js';

const mongoIdArb = fc.stringMatching(/^[0-9a-f]{24}$/);
const nonBlankTextArb = fc
  .string({ minLength: 1, maxLength: 80 })
  .filter((value) => value.trim().length > 0);
const nameArb = fc.string({ minLength: 0, maxLength: 40 });

describe('Comment aggregate properties', () => {
  // Property: create stores a trimmed description for any padded non-blank text
  test('create always stores trimmed description', () => {
    fc.assert(
      fc.property(
        mongoIdArb,
        mongoIdArb,
        nonBlankTextArb,
        nameArb,
        nameArb,
        (id, authorId, description, firstName, lastName) => {
          const comment = Comment.create({
            id,
            description: `  ${description}  `,
            authorId,
            firstName,
            lastName,
            now: '2026-01-01T00:00:00.000Z',
          });
          expect(comment.toSnapshot().description).toBe(description.trim());
        },
      ),
      { numRuns: 100 },
    );
  });

  // Property: updateDescription then reconstitute round-trip preserves identity fields
  test('updateDescription preserves id, author, and names', () => {
    fc.assert(
      fc.property(
        mongoIdArb,
        mongoIdArb,
        nonBlankTextArb,
        nonBlankTextArb,
        nameArb,
        nameArb,
        (id, authorId, initial, next, firstName, lastName) => {
          const comment = Comment.create({
            id,
            description: initial,
            authorId,
            firstName,
            lastName,
            now: '2026-01-01T00:00:00.000Z',
          });
          comment.updateDescription(next);
          const snapshot = comment.toSnapshot();
          expect(snapshot.id).toBe(id);
          expect(snapshot.authorId).toBe(authorId);
          expect(snapshot.firstName).toBe(firstName);
          expect(snapshot.lastName).toBe(lastName);
          expect(snapshot.description).toBe(next.trim());
        },
      ),
      { numRuns: 100 },
    );
  });

  // Property: blank (whitespace-only) descriptions always reject
  test('blank descriptions always throw InvalidCommentError', () => {
    fc.assert(
      fc.property(
        mongoIdArb,
        mongoIdArb,
        fc.constantFrom('', ' ', '   ', '\t', '\n'),
        nameArb,
        nameArb,
        (id, authorId, blank, firstName, lastName) => {
          expect(() =>
            Comment.create({
              id,
              description: blank,
              authorId,
              firstName,
              lastName,
            }),
          ).toThrow(InvalidCommentError);
        },
      ),
      { numRuns: 50 },
    );
  });

  // Property: reconstitute + toSnapshot is an identity for any valid snapshot
  test('reconstitute round-trips snapshot fields', () => {
    fc.assert(
      fc.property(
        mongoIdArb,
        mongoIdArb,
        nonBlankTextArb,
        nameArb,
        nameArb,
        (id, authorId, description, firstName, lastName) => {
          const snapshot = {
            id,
            description: description.trim(),
            authorId,
            firstName,
            lastName,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-02T00:00:00.000Z',
          };
          expect(Comment.reconstitute(snapshot).toSnapshot()).toEqual(snapshot);
        },
      ),
      { numRuns: 100 },
    );
  });
});

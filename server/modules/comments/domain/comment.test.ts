import { Comment } from './comment.js';
import { InvalidCommentError } from './errors.js';

describe('Comment aggregate', () => {
  const authorId = '507f1f77bcf86cd799439011';
  const commentId = '507f1f77bcf86cd799439013';

  describe('create', () => {
    test('when description and author are valid — creates comment with denormalized names', () => {
      const comment = Comment.create({
        id: commentId,
        description: 'nice post',
        authorId,
        firstName: 'Ada',
        lastName: 'Lovelace',
        now: '2026-01-01T00:00:00.000Z',
      });

      expect(comment.toSnapshot()).toEqual({
        id: commentId,
        description: 'nice post',
        authorId,
        firstName: 'Ada',
        lastName: 'Lovelace',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      });
    });

    test('when description has surrounding whitespace — trims it', () => {
      const comment = Comment.create({
        id: commentId,
        description: '  hello  ',
        authorId,
        firstName: 'Ada',
        lastName: 'Lovelace',
        now: '2026-01-01T00:00:00.000Z',
      });

      expect(comment.toSnapshot().description).toBe('hello');
    });

    test('when description is blank — throws InvalidCommentError', () => {
      expect(() =>
        Comment.create({
          id: commentId,
          description: '   ',
          authorId,
          firstName: 'Ada',
          lastName: 'Lovelace',
        }),
      ).toThrow(InvalidCommentError);
    });

    test('when author is missing — throws InvalidCommentError', () => {
      expect(() =>
        Comment.create({
          id: commentId,
          description: 'ok',
          authorId: '',
          firstName: 'Ada',
          lastName: 'Lovelace',
        }),
      ).toThrow(InvalidCommentError);
    });

    test('when id is blank — throws InvalidCommentError', () => {
      expect(() =>
        Comment.create({
          id: '   ',
          description: 'ok',
          authorId,
          firstName: 'Ada',
          lastName: 'Lovelace',
        }),
      ).toThrow(InvalidCommentError);
    });

    test('when names are empty strings — keeps them as provided (legacy)', () => {
      const comment = Comment.create({
        id: commentId,
        description: 'ok',
        authorId,
        firstName: '',
        lastName: '',
        now: '2026-01-01T00:00:00.000Z',
      });

      expect(comment.toSnapshot().firstName).toBe('');
      expect(comment.toSnapshot().lastName).toBe('');
    });
  });

  describe('reconstitute', () => {
    test('when given a snapshot — restores the same values', () => {
      const snapshot = {
        id: commentId,
        description: 'restored',
        authorId,
        firstName: 'Ada',
        lastName: 'Lovelace',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      };

      const comment = Comment.reconstitute(snapshot);

      expect(comment.toSnapshot()).toEqual(snapshot);
    });
  });

  describe('updateDescription', () => {
    test('when description is valid — trims and updates description', () => {
      const comment = Comment.create({
        id: commentId,
        description: 'original',
        authorId,
        firstName: 'Ada',
        lastName: 'Lovelace',
        now: '2026-01-01T00:00:00.000Z',
      });

      comment.updateDescription('  edited  ');

      expect(comment.toSnapshot().description).toBe('edited');
    });

    test('when description is blank — throws InvalidCommentError', () => {
      const comment = Comment.create({
        id: commentId,
        description: 'original',
        authorId,
        firstName: 'Ada',
        lastName: 'Lovelace',
      });

      expect(() => comment.updateDescription('   ')).toThrow(
        InvalidCommentError,
      );
    });

    test('when description changes — touches updatedAt', () => {
      const comment = Comment.create({
        id: commentId,
        description: 'original',
        authorId,
        firstName: 'Ada',
        lastName: 'Lovelace',
        now: '2026-01-01T00:00:00.000Z',
      });

      comment.updateDescription('edited');

      expect(comment.toSnapshot().updatedAt).not.toBe(
        '2026-01-01T00:00:00.000Z',
      );
      expect(comment.toSnapshot().createdAt).toBe('2026-01-01T00:00:00.000Z');
    });
  });

  describe('toSnapshot', () => {
    test('when snapshot is mutated — aggregate state is unchanged', () => {
      const comment = Comment.create({
        id: commentId,
        description: 'safe',
        authorId,
        firstName: 'Ada',
        lastName: 'Lovelace',
        now: '2026-01-01T00:00:00.000Z',
      });

      const snapshot = comment.toSnapshot();
      snapshot.description = 'mutated';
      snapshot.firstName = 'Mutated';

      expect(comment.toSnapshot().description).toBe('safe');
      expect(comment.toSnapshot().firstName).toBe('Ada');
    });
  });
});

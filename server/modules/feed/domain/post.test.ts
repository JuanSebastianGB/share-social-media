import { Post } from './post.js';
import { InvalidPostError } from './errors.js';

describe('Post aggregate', () => {
  const authorId = '507f1f77bcf86cd799439011';
  const otherUserId = '507f1f77bcf86cd799439012';

  describe('create', () => {
    test('when body and author are valid — creates post with empty likes and comments', () => {
      const post = Post.create({
        id: '507f1f77bcf86cd799439013',
        body: 'hello feed',
        authorId,
        type: 'text',
        now: '2026-01-01T00:00:00.000Z',
      });

      expect(post.toSnapshot()).toEqual({
        id: '507f1f77bcf86cd799439013',
        body: 'hello feed',
        authorId,
        fileId: undefined,
        likes: {},
        comments: [],
        type: 'text',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      });
    });

    test('when body is blank — throws InvalidPostError', () => {
      expect(() =>
        Post.create({ id: 'a', body: '   ', authorId }),
      ).toThrow(InvalidPostError);
    });

    test('when author is missing — throws InvalidPostError', () => {
      expect(() =>
        Post.create({ id: 'a', body: 'ok', authorId: '' }),
      ).toThrow(InvalidPostError);
    });
  });

  describe('toggleLike', () => {
    test('when user has not liked — adds like', () => {
      const post = Post.create({ id: 'p1', body: 'x', authorId });
      post.toggleLike(otherUserId);
      expect(post.toSnapshot().likes[otherUserId]).toBe(true);
    });

    test('when user already liked — removes like', () => {
      const post = Post.create({ id: 'p1', body: 'x', authorId });
      post.toggleLike(otherUserId);
      post.toggleLike(otherUserId);
      expect(post.toSnapshot().likes[otherUserId]).toBeUndefined();
    });

    test('when user id is empty — throws InvalidPostError', () => {
      const post = Post.create({ id: 'p1', body: 'x', authorId });
      expect(() => post.toggleLike('')).toThrow(InvalidPostError);
    });
  });

  describe('attachCommentId', () => {
    test('when comment id is new — appends it', () => {
      const post = Post.create({ id: 'p1', body: 'x', authorId });
      post.attachCommentId('c1');
      expect(post.toSnapshot().comments).toEqual(['c1']);
    });

    test('when comment id already present — is a no-op', () => {
      const post = Post.create({ id: 'p1', body: 'x', authorId });
      post.attachCommentId('c1');
      post.attachCommentId('c1');
      expect(post.toSnapshot().comments).toEqual(['c1']);
    });
  });
});

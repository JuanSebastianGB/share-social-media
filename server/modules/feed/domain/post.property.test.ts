import * as fc from 'fast-check';
import { Post } from './post.js';

const mongoIdArb = fc.stringMatching(/^[0-9a-f]{24}$/);

describe('Post aggregate properties', () => {
  const authorId = '507f1f77bcf86cd799439011';

  // Property: for any valid userId, toggling like twice restores the likes map
  test('toggling like twice restores likes', () => {
    fc.assert(
      fc.property(mongoIdArb, (userId) => {
        const post = Post.create({
          id: '507f1f77bcf86cd799439099',
          body: 'property body',
          authorId,
        });
        const before = { ...post.toSnapshot().likes };
        post.toggleLike(userId);
        post.toggleLike(userId);
        expect(post.toSnapshot().likes).toEqual(before);
      }),
      { numRuns: 100 },
    );
  });

  // Property: for any sequence of distinct user ids, like keys are unique and values are true
  test('likes map keys are unique with true values', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(mongoIdArb, {
          minLength: 1,
          maxLength: 10,
        }),
        (userIds) => {
          const post = Post.create({
            id: '507f1f77bcf86cd799439098',
            body: 'likes property',
            authorId,
          });
          for (const userId of userIds) {
            post.toggleLike(userId);
          }
          const likes = post.toSnapshot().likes;
          const keys = Object.keys(likes);
          expect(keys).toHaveLength(userIds.length);
          for (const userId of userIds) {
            expect(likes[userId]).toBe(true);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

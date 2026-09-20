import { InMemoryCommentRepository } from '../../infrastructure/in-memory-comment-repository.js';
import { createComment } from './create-comment.js';
import { createCommentOnPost } from './create-comment-on-post.js';
import { deleteComment } from './delete-comment.js';
import { getComment } from './get-comment.js';
import { listComments } from './list-comments.js';
import { updateComment } from './update-comment.js';

describe('Comments use cases', () => {
  const repo = new InMemoryCommentRepository();
  const authorId = '507f1f77bcf86cd799439011';
  const commentId = '507f1f77bcf86cd799439013';

  beforeEach(() => {
    repo.clear();
  });

  test('createComment — persists aggregate and returns it', async () => {
    const comment = await createComment(repo, {
      id: commentId,
      description: 'usecase body',
      authorId,
      firstName: 'Ada',
      lastName: 'Lovelace',
    });

    expect(comment.toSnapshot().description).toBe('usecase body');
    expect(comment.toSnapshot().authorId).toBe(authorId);
    const found = await repo.findById(commentId);
    expect(found).not.toBeNull();
  });

  test('createComment — when id omitted — generates id and persists', async () => {
    const comment = await createComment(repo, {
      description: 'no id provided',
      authorId,
      firstName: 'Ada',
      lastName: 'Lovelace',
    });

    const id = comment.toSnapshot().id;
    expect(id.length).toBeGreaterThan(0);
    const found = await repo.findById(id);
    expect(found).not.toBeNull();
  });

  test('getComment — when missing — returns null', async () => {
    const result = await getComment(repo, commentId);
    expect(result).toBeNull();
  });

  test('getComment — when present — returns aggregate', async () => {
    await createComment(repo, {
      id: commentId,
      description: 'find me',
      authorId,
      firstName: 'Ada',
      lastName: 'Lovelace',
    });
    const found = await getComment(repo, commentId);
    expect(found?.toSnapshot().description).toBe('find me');
  });

  test('listComments — returns all persisted comments', async () => {
    await createComment(repo, {
      id: '507f1f77bcf86cd799439014',
      description: 'one',
      authorId,
      firstName: 'Ada',
      lastName: 'Lovelace',
    });
    await createComment(repo, {
      id: '507f1f77bcf86cd799439015',
      description: 'two',
      authorId,
      firstName: 'Ada',
      lastName: 'Lovelace',
    });

    const listed = await listComments(repo);
    expect(listed).toHaveLength(2);
    expect(listed.map((c) => c.toSnapshot().description).sort()).toEqual([
      'one',
      'two',
    ]);
  });

  test('updateComment — when missing — matchedCount 0', async () => {
    const result = await updateComment(repo, commentId, {
      description: 'nope',
    });
    expect(result).toEqual({
      acknowledged: true,
      matchedCount: 0,
      modifiedCount: 0,
    });
  });

  test('updateComment — when description patch — persists via domain', async () => {
    await createComment(repo, {
      id: commentId,
      description: 'before',
      authorId,
      firstName: 'Ada',
      lastName: 'Lovelace',
    });

    const result = await updateComment(repo, commentId, {
      description: 'after',
    });
    expect(result).toEqual({
      acknowledged: true,
      matchedCount: 1,
      modifiedCount: 1,
    });
    const found = await repo.findById(commentId);
    expect(found?.toSnapshot().description).toBe('after');
  });

  test('updateComment — when firstName/lastName patch — persists names', async () => {
    await createComment(repo, {
      id: commentId,
      description: 'names',
      authorId,
      firstName: 'Ada',
      lastName: 'Lovelace',
    });

    const result = await updateComment(repo, commentId, {
      firstName: 'Grace',
      lastName: 'Hopper',
    });
    expect(result).toEqual({
      acknowledged: true,
      matchedCount: 1,
      modifiedCount: 1,
    });
    const found = await repo.findById(commentId);
    expect(found?.toSnapshot().firstName).toBe('Grace');
    expect(found?.toSnapshot().lastName).toBe('Hopper');
  });

  test('deleteComment — when missing — deletedCount 0', async () => {
    const result = await deleteComment(repo, commentId);
    expect(result).toEqual({ acknowledged: true, deletedCount: 0 });
  });

  test('deleteComment — when present — deletes and deletedCount 1', async () => {
    await createComment(repo, {
      id: commentId,
      description: 'gone',
      authorId,
      firstName: 'Ada',
      lastName: 'Lovelace',
    });

    const result = await deleteComment(repo, commentId);
    expect(result).toEqual({ acknowledged: true, deletedCount: 1 });
    expect(await repo.findById(commentId)).toBeNull();
  });

  test('createCommentOnPost — saves, attaches, returns hydrated post[0]', async () => {
    const attachCalls: Array<[string, string]> = [];
    const hydrated = [{ _id: 'post-1', comments: ['x'] }];

    const result = await createCommentOnPost(
      repo,
      {
        attachComment: async (postId, commentIdArg) => {
          attachCalls.push([postId, commentIdArg]);
        },
        getHydratedPost: async () => hydrated,
      },
      {
        postId: 'post-1',
        description: 'on post',
        authorId,
        firstName: 'Ada',
        lastName: 'Lovelace',
        id: commentId,
      },
    );

    expect(attachCalls).toEqual([['post-1', commentId]]);
    expect(result).toEqual(hydrated[0]);
    expect(await repo.findById(commentId)).not.toBeNull();
  });
});

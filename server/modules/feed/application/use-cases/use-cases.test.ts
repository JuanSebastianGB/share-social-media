import { InMemoryPostRepository } from '../../infrastructure/in-memory-post-repository.js';
import { attachCommentToPost } from './attach-comment-to-post.js';
import { createPost } from './create-post.js';
import { toggleLikePost } from './toggle-like-post.js';

describe('Feed use cases', () => {
  const repo = new InMemoryPostRepository();

  beforeEach(() => {
    repo.clear();
  });

  test('createPost — persists aggregate and returns it', async () => {
    const post = await createPost(repo, {
      body: 'usecase body',
      authorId: '507f1f77bcf86cd799439011',
      type: 'text',
      id: '507f1f77bcf86cd799439099',
    });

    expect(post.toSnapshot().body).toBe('usecase body');
    const found = await repo.findById('507f1f77bcf86cd799439099');
    expect(found).not.toBeNull();
  });

  test('toggleLikePost — when post missing — returns null', async () => {
    const result = await toggleLikePost(
      repo,
      '507f1f77bcf86cd799439011',
      '507f1f77bcf86cd799439012',
    );
    expect(result).toBeNull();
  });

  test('toggleLikePost — when post exists — persists like', async () => {
    await createPost(repo, {
      id: '507f1f77bcf86cd799439099',
      body: 'like me',
      authorId: '507f1f77bcf86cd799439011',
    });
    const liked = await toggleLikePost(
      repo,
      '507f1f77bcf86cd799439099',
      '507f1f77bcf86cd799439012',
    );
    expect(liked?.toSnapshot().likes['507f1f77bcf86cd799439012']).toBe(true);
  });

  test('attachCommentToPost — when post exists — persists comment id', async () => {
    await createPost(repo, {
      id: '507f1f77bcf86cd799439099',
      body: 'comment me',
      authorId: '507f1f77bcf86cd799439011',
    });
    const updated = await attachCommentToPost(
      repo,
      '507f1f77bcf86cd799439099',
      '507f1f77bcf86cd799439088',
    );
    expect(updated?.toSnapshot().comments).toEqual([
      '507f1f77bcf86cd799439088',
    ]);
  });

  test('attachCommentToPost — when post missing — returns null', async () => {
    const result = await attachCommentToPost(
      repo,
      '507f1f77bcf86cd799439011',
      '507f1f77bcf86cd799439088',
    );
    expect(result).toBeNull();
  });

  test('attachCommentToPost — when comment already attached — is idempotent', async () => {
    await createPost(repo, {
      id: '507f1f77bcf86cd799439099',
      body: 'comment me',
      authorId: '507f1f77bcf86cd799439011',
    });
    await attachCommentToPost(
      repo,
      '507f1f77bcf86cd799439099',
      '507f1f77bcf86cd799439088',
    );
    const again = await attachCommentToPost(
      repo,
      '507f1f77bcf86cd799439099',
      '507f1f77bcf86cd799439088',
    );
    expect(again?.toSnapshot().comments).toEqual([
      '507f1f77bcf86cd799439088',
    ]);
  });
});

import { Post } from '../domain/post.js';
import { InMemoryPostRepository } from './in-memory-post-repository.js';

describe('InMemoryPostRepository', () => {
  const repo = new InMemoryPostRepository();

  beforeEach(() => {
    repo.clear();
  });

  test('when post is saved — findById returns reconstituted aggregate', async () => {
    const post = Post.create({
      id: '507f1f77bcf86cd799439011',
      body: 'persisted',
      authorId: '507f1f77bcf86cd799439012',
      now: '2026-02-01T00:00:00.000Z',
    });
    await repo.save(post);

    const found = await repo.findById(post.toSnapshot().id);
    expect(found?.toSnapshot().body).toBe('persisted');
  });

  test('listFeedIds orders newest first', async () => {
    const older = Post.create({
      id: '507f1f77bcf86cd799439001',
      body: 'old',
      authorId: '507f1f77bcf86cd799439012',
      now: '2026-01-01T00:00:00.000Z',
    });
    const newer = Post.create({
      id: '507f1f77bcf86cd799439002',
      body: 'new',
      authorId: '507f1f77bcf86cd799439012',
      now: '2026-03-01T00:00:00.000Z',
    });
    await repo.save(older);
    await repo.save(newer);

    expect(await repo.listFeedIds()).toEqual([
      '507f1f77bcf86cd799439002',
      '507f1f77bcf86cd799439001',
    ]);
  });
});

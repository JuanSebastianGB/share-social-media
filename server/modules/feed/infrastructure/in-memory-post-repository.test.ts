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

  test('queryFeedIds resumes after an opaque continuation', async () => {
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

    const first = await repo.queryFeedIds({ limit: 1 });
    expect(first.ids).toEqual(['507f1f77bcf86cd799439002']);
    expect(first.continuation).toBe('507f1f77bcf86cd799439002');

    const second = await repo.queryFeedIds({
      limit: 1,
      continuation: first.continuation,
    });
    expect(second.ids).toEqual(['507f1f77bcf86cd799439001']);
    expect(second.continuation).toBeUndefined();
  });

  test('a continuation that is not a stored post ends the walk', async () => {
    await repo.save(
      Post.create({
        id: '507f1f77bcf86cd799439002',
        body: 'new',
        authorId: '507f1f77bcf86cd799439012',
        now: '2026-03-01T00:00:00.000Z',
      }),
    );

    const page = await repo.queryFeedIds({
      limit: 1,
      continuation: '{"PK":"POST#nope"}',
    });
    expect(page).toEqual({ ids: [] });
  });
});

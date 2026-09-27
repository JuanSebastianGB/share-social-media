import { Post } from '../../domain/post.js';
import { InMemoryPostRepository } from '../../infrastructure/in-memory-post-repository.js';
import type { PostAssemblerDeps } from '../read/post-assembler.js';
import { listFeedPostsPage } from './query-posts.js';

class CountingRepo extends InMemoryPostRepository {
  reads = 0;

  override async findById(id: string): Promise<Post | null> {
    this.reads += 1;
    return super.findById(id);
  }
}

const deps: PostAssemblerDeps = {
  getFile: async (id) =>
    id === 'missing' ? null : { _id: id, url: 'https://media.local/f' },
  getUser: async (id) => ({
    _id: id,
    firstName: 'Ada',
    lastName: 'Lovelace',
    location: 'Paris',
    profileImageId: 'pic',
  }),
};

function makePost(id: string, body: string, now: string, fileId = 'file-1') {
  return Post.create({
    id,
    body,
    authorId: 'author-1',
    fileId,
    now,
  });
}

describe('listFeedPostsPage', () => {
  test('empty search stops after the hydrated page', async () => {
    const repo = new CountingRepo();
    await repo.save(makePost('p1', 'one', '2026-01-01T00:00:00.000Z'));
    await repo.save(makePost('p2', 'two', '2026-02-01T00:00:00.000Z'));
    await repo.save(makePost('p3', 'three', '2026-03-01T00:00:00.000Z'));
    await repo.save(makePost('p4', 'four', '2026-04-01T00:00:00.000Z'));
    await repo.save(makePost('p5', 'five', '2026-05-01T00:00:00.000Z'));

    const page = await listFeedPostsPage(repo, deps, 0, 2, '');

    expect(page.map((post) => post._id)).toEqual(['p5', 'p4']);
    expect(repo.reads).toBe(2);
  });

  test('posts that fail hydration do not occupy a page slot', async () => {
    const repo = new CountingRepo();
    await repo.save(makePost('p0', 'tail', '2025-12-01T00:00:00.000Z'));
    await repo.save(makePost('p1', 'one', '2026-01-01T00:00:00.000Z'));
    await repo.save(makePost('p2', 'two', '2026-02-01T00:00:00.000Z'));
    await repo.save(
      makePost('p3', 'dropped', '2026-03-01T00:00:00.000Z', 'missing'),
    );

    const page = await listFeedPostsPage(repo, deps, 0, 2, '');

    expect(page.map((post) => post._id)).toEqual(['p2', 'p1']);
    expect(repo.reads).toBe(3);
  });

  test('search still returns a match past the first raw page', async () => {
    const repo = new CountingRepo();
    await repo.save(makePost('p1', 'needle', '2026-01-01T00:00:00.000Z'));
    await repo.save(makePost('p2', 'plain', '2026-02-01T00:00:00.000Z'));
    await repo.save(makePost('p3', 'plain', '2026-03-01T00:00:00.000Z'));
    await repo.save(makePost('p4', 'plain', '2026-04-01T00:00:00.000Z'));
    await repo.save(makePost('p5', 'plain', '2026-05-01T00:00:00.000Z'));

    const page = await listFeedPostsPage(repo, deps, 0, 2, 'needle');

    expect(page.map((post) => post._id)).toEqual(['p1']);
    expect(repo.reads).toBe(5);
  });
});

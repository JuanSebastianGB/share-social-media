import { Comment } from '../domain/comment.js';
import { InMemoryCommentRepository } from './in-memory-comment-repository.js';

describe('InMemoryCommentRepository', () => {
  const repo = new InMemoryCommentRepository();

  beforeEach(() => {
    repo.clear();
  });

  test('when comment is saved — findById returns reconstituted aggregate', async () => {
    const comment = Comment.create({
      id: '507f1f77bcf86cd799439011',
      description: 'persisted',
      authorId: '507f1f77bcf86cd799439012',
      firstName: 'Ada',
      lastName: 'Lovelace',
      now: '2026-02-01T00:00:00.000Z',
    });
    await repo.save(comment);

    const found = await repo.findById(comment.toSnapshot().id);
    expect(found?.toSnapshot()).toEqual({
      id: '507f1f77bcf86cd799439011',
      description: 'persisted',
      authorId: '507f1f77bcf86cd799439012',
      firstName: 'Ada',
      lastName: 'Lovelace',
      createdAt: '2026-02-01T00:00:00.000Z',
      updatedAt: '2026-02-01T00:00:00.000Z',
    });
  });

  test('findById returns null when missing', async () => {
    expect(await repo.findById('missing')).toBeNull();
  });

  test('delete returns false when missing and true when present', async () => {
    const comment = Comment.create({
      id: '507f1f77bcf86cd799439021',
      description: 'to delete',
      authorId: '507f1f77bcf86cd799439012',
      firstName: 'Ada',
      lastName: 'Lovelace',
      now: '2026-02-01T00:00:00.000Z',
    });
    await repo.save(comment);

    expect(await repo.delete('missing')).toBe(false);
    expect(await repo.delete(comment.toSnapshot().id)).toBe(true);
    expect(await repo.findById(comment.toSnapshot().id)).toBeNull();
  });

  test('list returns all saved comments (unsorted — mirrors legacy Scan)', async () => {
    const first = Comment.create({
      id: '507f1f77bcf86cd799439031',
      description: 'first',
      authorId: '507f1f77bcf86cd799439012',
      firstName: 'Ada',
      lastName: 'Lovelace',
      now: '2026-01-01T00:00:00.000Z',
    });
    const second = Comment.create({
      id: '507f1f77bcf86cd799439032',
      description: 'second',
      authorId: '507f1f77bcf86cd799439012',
      firstName: 'Ada',
      lastName: 'Lovelace',
      now: '2026-03-01T00:00:00.000Z',
    });
    await repo.save(first);
    await repo.save(second);

    const listed = await repo.list();
    const ids = listed.map((c) => c.toSnapshot().id).sort();
    expect(ids).toEqual([
      '507f1f77bcf86cd799439031',
      '507f1f77bcf86cd799439032',
    ]);
  });

  test('domain updateDescription then save persists new description', async () => {
    const comment = Comment.create({
      id: '507f1f77bcf86cd799439041',
      description: 'original',
      authorId: '507f1f77bcf86cd799439012',
      firstName: 'Ada',
      lastName: 'Lovelace',
      now: '2026-02-01T00:00:00.000Z',
    });
    await repo.save(comment);

    const loaded = await repo.findById(comment.toSnapshot().id);
    loaded!.updateDescription('revised');
    await repo.save(loaded!);

    const found = await repo.findById(comment.toSnapshot().id);
    expect(found?.toSnapshot().description).toBe('revised');
  });
});

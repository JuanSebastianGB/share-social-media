import { MediaFile } from '../domain/media-file.js';
import { InMemoryMediaFileRepository } from './in-memory-media-file-repository.js';

describe('InMemoryMediaFileRepository', () => {
  const repo = new InMemoryMediaFileRepository();

  beforeEach(() => {
    repo.clear();
  });

  test('when file is saved — findById returns reconstituted aggregate', async () => {
    const file = MediaFile.create({
      id: '507f1f77bcf86cd799439014',
      fileName: 'photo.png',
      url: 'https://cdn.example/photo.png',
      now: '2026-02-01T00:00:00.000Z',
    });
    await repo.save(file);

    const found = await repo.findById(file.toSnapshot().id);
    expect(found?.toSnapshot()).toEqual({
      id: '507f1f77bcf86cd799439014',
      fileName: 'photo.png',
      url: 'https://cdn.example/photo.png',
      deleted: false,
      createdAt: '2026-02-01T00:00:00.000Z',
      updatedAt: '2026-02-01T00:00:00.000Z',
    });
  });

  test('findById returns null when missing', async () => {
    expect(await repo.findById('missing')).toBeNull();
  });

  test('findById returns null when soft-deleted; findByIdIncludingDeleted returns it', async () => {
    const file = MediaFile.create({
      id: '507f1f77bcf86cd799439015',
      fileName: 'gone.png',
      now: '2026-02-01T00:00:00.000Z',
    });
    await repo.save(file);

    const loaded = await repo.findById(file.toSnapshot().id);
    loaded!.softDelete();
    await repo.save(loaded!);

    expect(await repo.findById(file.toSnapshot().id)).toBeNull();
    const including = await repo.findByIdIncludingDeleted(
      file.toSnapshot().id,
    );
    expect(including?.toSnapshot().deleted).toBe(true);
    expect(including?.toSnapshot().fileName).toBe('gone.png');
  });

  test('list returns only non-deleted files', async () => {
    const active = MediaFile.create({
      id: '507f1f77bcf86cd799439031',
      fileName: 'active.png',
      now: '2026-01-01T00:00:00.000Z',
    });
    const doomed = MediaFile.create({
      id: '507f1f77bcf86cd799439032',
      fileName: 'doomed.png',
      now: '2026-03-01T00:00:00.000Z',
    });
    await repo.save(active);
    await repo.save(doomed);

    const loaded = await repo.findById(doomed.toSnapshot().id);
    loaded!.softDelete();
    await repo.save(loaded!);

    const listed = await repo.list();
    const ids = listed.map((f) => f.toSnapshot().id);
    expect(ids).toEqual(['507f1f77bcf86cd799439031']);
  });

  test('delete returns false when missing and true when present (including soft-deleted)', async () => {
    const file = MediaFile.create({
      id: '507f1f77bcf86cd799439021',
      fileName: 'to-delete.png',
      now: '2026-02-01T00:00:00.000Z',
    });
    await repo.save(file);

    expect(await repo.delete('missing')).toBe(false);
    expect(await repo.delete(file.toSnapshot().id)).toBe(true);
    expect(await repo.findByIdIncludingDeleted(file.toSnapshot().id)).toBeNull();

    const soft = MediaFile.create({
      id: '507f1f77bcf86cd799439022',
      fileName: 'soft.png',
      now: '2026-02-01T00:00:00.000Z',
    });
    await repo.save(soft);
    const loaded = await repo.findById(soft.toSnapshot().id);
    loaded!.softDelete();
    await repo.save(loaded!);

    expect(await repo.delete(soft.toSnapshot().id)).toBe(true);
    expect(await repo.findByIdIncludingDeleted(soft.toSnapshot().id)).toBeNull();
  });

  test('domain softDelete then save persists deleted flag', async () => {
    const file = MediaFile.create({
      id: '507f1f77bcf86cd799439041',
      fileName: 'soft.png',
      now: '2026-02-01T00:00:00.000Z',
    });
    await repo.save(file);

    const loaded = await repo.findById(file.toSnapshot().id);
    loaded!.softDelete();
    await repo.save(loaded!);

    const including = await repo.findByIdIncludingDeleted(
      file.toSnapshot().id,
    );
    expect(including?.toSnapshot().deleted).toBe(true);
  });
});

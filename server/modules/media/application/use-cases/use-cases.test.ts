import { InMemoryMediaFileRepository } from '../../infrastructure/in-memory-media-file-repository.js';
import { InMemoryMediaObjectStore } from '../../infrastructure/in-memory-media-object-store.js';
import { createDefaultMediaFile } from './create-default-media-file.js';
import { createMediaFile } from './create-media-file.js';
import { getMediaFile } from './get-media-file.js';
import { hardDeleteMediaFile } from './hard-delete-media-file.js';
import { listMediaFiles } from './list-media-files.js';
import { softDeleteMediaFile } from './soft-delete-media-file.js';

describe('Media use cases', () => {
  const repo = new InMemoryMediaFileRepository();
  const objectStore = new InMemoryMediaObjectStore();
  const fileId = '507f1f77bcf86cd799439014';

  beforeEach(() => {
    repo.clear();
    objectStore.clear();
  });

  test('createMediaFile — persists aggregate and returns it', async () => {
    const file = await createMediaFile(repo, {
      id: fileId,
      fileName: 'photo.png',
      url: 'https://cdn.example/photo.png',
      now: '2026-02-01T00:00:00.000Z',
    });

    expect(file.toSnapshot().fileName).toBe('photo.png');
    const found = await repo.findById(fileId);
    expect(found).not.toBeNull();
  });

  test('createMediaFile — when id omitted — generates id and persists', async () => {
    const file = await createMediaFile(repo, {
      fileName: 'auto.png',
    });
    const id = file.toSnapshot().id;
    expect(id.length).toBeGreaterThan(0);
    expect(await repo.findById(id)).not.toBeNull();
  });

  test('getMediaFile — when missing — returns null', async () => {
    expect(await getMediaFile(repo, fileId)).toBeNull();
  });

  test('getMediaFile — when present — returns aggregate', async () => {
    await createMediaFile(repo, {
      id: fileId,
      fileName: 'find-me.png',
    });
    const found = await getMediaFile(repo, fileId);
    expect(found?.toSnapshot().fileName).toBe('find-me.png');
  });

  test('getMediaFile — when soft-deleted — returns null', async () => {
    await createMediaFile(repo, { id: fileId, fileName: 'gone.png' });
    await softDeleteMediaFile(repo, fileId);
    expect(await getMediaFile(repo, fileId)).toBeNull();
  });

  test('listMediaFiles — returns only non-deleted', async () => {
    await createMediaFile(repo, {
      id: '507f1f77bcf86cd799439031',
      fileName: 'one.png',
    });
    await createMediaFile(repo, {
      id: '507f1f77bcf86cd799439032',
      fileName: 'two.png',
    });
    await softDeleteMediaFile(repo, '507f1f77bcf86cd799439032');

    const listed = await listMediaFiles(repo);
    expect(listed).toHaveLength(1);
    expect(listed[0].toSnapshot().fileName).toBe('one.png');
  });

  test('softDeleteMediaFile — when missing — deletedCount 0', async () => {
    expect(await softDeleteMediaFile(repo, fileId)).toEqual({
      acknowledged: true,
      deletedCount: 0,
    });
  });

  test('softDeleteMediaFile — when active — deletedCount 1 and hides from findById', async () => {
    await createMediaFile(repo, { id: fileId, fileName: 'soft.png' });
    expect(await softDeleteMediaFile(repo, fileId)).toEqual({
      acknowledged: true,
      deletedCount: 1,
    });
    expect(await getMediaFile(repo, fileId)).toBeNull();
    const including = await repo.findByIdIncludingDeleted(fileId);
    expect(including?.toSnapshot().deleted).toBe(true);
  });

  test('softDeleteMediaFile — when already deleted — deletedCount 0', async () => {
    await createMediaFile(repo, { id: fileId, fileName: 'soft.png' });
    await softDeleteMediaFile(repo, fileId);
    expect(await softDeleteMediaFile(repo, fileId)).toEqual({
      acknowledged: true,
      deletedCount: 0,
    });
  });

  test('hardDeleteMediaFile — when missing — deletedCount 0', async () => {
    expect(await hardDeleteMediaFile(repo, objectStore, fileId)).toEqual({
      acknowledged: true,
      deletedCount: 0,
    });
  });

  test('hardDeleteMediaFile — deletes row and best-effort object store', async () => {
    await createMediaFile(repo, {
      id: fileId,
      fileName: 'hard.png',
      url: 'https://cdn.example/hard.png',
    });

    expect(await hardDeleteMediaFile(repo, objectStore, fileId)).toEqual({
      acknowledged: true,
      deletedCount: 1,
    });
    expect(await repo.findByIdIncludingDeleted(fileId)).toBeNull();
    expect(objectStore.deletedKeys).toEqual(['https://cdn.example/hard.png']);
  });

  test('hardDeleteMediaFile — object store failure still deletes row', async () => {
    const failingStore = {
      async deleteObject(): Promise<void> {
        throw new Error('s3 down');
      },
    };
    await createMediaFile(repo, {
      id: fileId,
      fileName: 'hard.png',
      url: 'https://cdn.example/hard.png',
    });

    expect(await hardDeleteMediaFile(repo, failingStore, fileId)).toEqual({
      acknowledged: true,
      deletedCount: 1,
    });
    expect(await repo.findByIdIncludingDeleted(fileId)).toBeNull();
  });

  test('createDefaultMediaFile — creates once then returns null', async () => {
    const first = await createDefaultMediaFile(repo);
    expect(first).not.toBeNull();
    expect(first!.toSnapshot().id).toBe('63cf4d2242c5e33c105a87eb');

    const second = await createDefaultMediaFile(repo);
    expect(second).toBeNull();
  });
});

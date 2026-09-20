import { InMemoryCatalogItemRepository } from '../../infrastructure/in-memory-catalog-item-repository.js';
import { createCatalogItem } from './create-catalog-item.js';
import { deleteCatalogItem } from './delete-catalog-item.js';
import { getCatalogItem } from './get-catalog-item.js';
import { listCatalogItems } from './list-catalog-items.js';
import { updateCatalogItem } from './update-catalog-item.js';

describe('Catalog use cases', () => {
  const repo = new InMemoryCatalogItemRepository();
  const itemId = '507f1f77bcf86cd799439014';

  beforeEach(() => {
    repo.clear();
  });

  test('createCatalogItem — persists aggregate and returns it', async () => {
    const item = await createCatalogItem(repo, {
      id: itemId,
      name: 'Widget',
      active: true,
      now: '2026-02-01T00:00:00.000Z',
    });

    expect(item.toSnapshot()).toEqual({
      id: itemId,
      name: 'Widget',
      active: true,
      createdAt: '2026-02-01T00:00:00.000Z',
      updatedAt: '2026-02-01T00:00:00.000Z',
    });
    expect(await repo.findById(itemId)).not.toBeNull();
  });

  test('createCatalogItem — when id omitted — generates id and persists', async () => {
    const item = await createCatalogItem(repo, {
      name: 'AutoId',
    });
    const id = item.toSnapshot().id;
    expect(id.length).toBeGreaterThan(0);
    expect(await repo.findById(id)).not.toBeNull();
  });

  test('getCatalogItem — when missing — returns null', async () => {
    expect(await getCatalogItem(repo, itemId)).toBeNull();
  });

  test('getCatalogItem — when present — returns aggregate', async () => {
    await createCatalogItem(repo, { id: itemId, name: 'FindMe' });
    const found = await getCatalogItem(repo, itemId);
    expect(found?.toSnapshot().name).toBe('FindMe');
  });

  test('listCatalogItems — returns all persisted items', async () => {
    await createCatalogItem(repo, {
      id: '507f1f77bcf86cd799439031',
      name: 'One',
    });
    await createCatalogItem(repo, {
      id: '507f1f77bcf86cd799439032',
      name: 'Two',
    });

    const listed = await listCatalogItems(repo);
    expect(listed).toHaveLength(2);
    const names = listed.map((i) => i.toSnapshot().name).sort();
    expect(names).toEqual(['One', 'Two']);
  });

  test('updateCatalogItem — when missing — zeros', async () => {
    expect(await updateCatalogItem(repo, itemId, { name: 'Nope' })).toEqual({
      acknowledged: true,
      matchedCount: 0,
      modifiedCount: 0,
    });
  });

  test('updateCatalogItem — applies name and active; ignores unknown keys and _id', async () => {
    await createCatalogItem(repo, {
      id: itemId,
      name: 'Before',
      active: true,
    });

    const result = await updateCatalogItem(repo, itemId, {
      _id: 'should-not-change',
      name: 'After',
      active: false,
      unknown: 'ignored',
    });

    expect(result).toEqual({
      acknowledged: true,
      matchedCount: 1,
      modifiedCount: 1,
    });
    const snap = (await getCatalogItem(repo, itemId))!.toSnapshot();
    expect(snap.id).toBe(itemId);
    expect(snap.name).toBe('After');
    expect(snap.active).toBe(false);
  });

  test('updateCatalogItem — name-only patch leaves active unchanged', async () => {
    await createCatalogItem(repo, {
      id: itemId,
      name: 'Before',
      active: true,
    });
    await updateCatalogItem(repo, itemId, { name: 'Renamed' });
    const snap = (await getCatalogItem(repo, itemId))!.toSnapshot();
    expect(snap.name).toBe('Renamed');
    expect(snap.active).toBe(true);
  });

  test('deleteCatalogItem — when missing — deletedCount 0', async () => {
    expect(await deleteCatalogItem(repo, itemId)).toEqual({
      acknowledged: true,
      deletedCount: 0,
    });
  });

  test('deleteCatalogItem — when present — deletedCount 1', async () => {
    await createCatalogItem(repo, { id: itemId, name: 'Gone' });
    expect(await deleteCatalogItem(repo, itemId)).toEqual({
      acknowledged: true,
      deletedCount: 1,
    });
    expect(await getCatalogItem(repo, itemId)).toBeNull();
  });
});

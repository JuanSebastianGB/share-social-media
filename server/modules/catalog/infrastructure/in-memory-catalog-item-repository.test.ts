import { CatalogItem } from '../domain/catalog-item.js';
import { InMemoryCatalogItemRepository } from './in-memory-catalog-item-repository.js';

describe('InMemoryCatalogItemRepository', () => {
  const repo = new InMemoryCatalogItemRepository();

  beforeEach(() => {
    repo.clear();
  });

  test('when item is saved — findById returns reconstituted aggregate', async () => {
    const item = CatalogItem.create({
      id: '507f1f77bcf86cd799439014',
      name: 'Widget',
      active: true,
      now: '2026-02-01T00:00:00.000Z',
    });
    await repo.save(item);

    const found = await repo.findById(item.toSnapshot().id);
    expect(found?.toSnapshot()).toEqual({
      id: '507f1f77bcf86cd799439014',
      name: 'Widget',
      active: true,
      createdAt: '2026-02-01T00:00:00.000Z',
      updatedAt: '2026-02-01T00:00:00.000Z',
    });
  });

  test('findById returns null when missing', async () => {
    expect(await repo.findById('missing')).toBeNull();
  });

  test('save overwrites existing item (full replace)', async () => {
    const item = CatalogItem.create({
      id: '507f1f77bcf86cd799439015',
      name: 'Original',
      now: '2026-02-01T00:00:00.000Z',
    });
    await repo.save(item);

    const loaded = await repo.findById(item.toSnapshot().id);
    loaded!.rename('Renamed');
    loaded!.setActive(false);
    await repo.save(loaded!);

    const found = await repo.findById(item.toSnapshot().id);
    expect(found?.toSnapshot().name).toBe('Renamed');
    expect(found?.toSnapshot().active).toBe(false);
    expect(found?.toSnapshot().createdAt).toBe('2026-02-01T00:00:00.000Z');
    expect(found?.toSnapshot().updatedAt).not.toBe(
      '2026-02-01T00:00:00.000Z',
    );
  });

  test('list returns all saved items (order not guaranteed)', async () => {
    const first = CatalogItem.create({
      id: '507f1f77bcf86cd799439031',
      name: 'Alpha',
      now: '2026-01-01T00:00:00.000Z',
    });
    const second = CatalogItem.create({
      id: '507f1f77bcf86cd799439032',
      name: 'Beta',
      active: false,
      now: '2026-03-01T00:00:00.000Z',
    });
    await repo.save(first);
    await repo.save(second);

    const listed = await repo.list();
    const ids = listed.map((i) => i.toSnapshot().id).sort();
    expect(ids).toEqual([
      '507f1f77bcf86cd799439031',
      '507f1f77bcf86cd799439032',
    ]);
  });

  test('delete returns false when missing and true when present', async () => {
    const item = CatalogItem.create({
      id: '507f1f77bcf86cd799439021',
      name: 'To delete',
      now: '2026-02-01T00:00:00.000Z',
    });
    await repo.save(item);

    expect(await repo.delete('missing')).toBe(false);
    expect(await repo.delete(item.toSnapshot().id)).toBe(true);
    expect(await repo.findById(item.toSnapshot().id)).toBeNull();
  });
});

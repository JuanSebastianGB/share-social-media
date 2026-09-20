import { CatalogItem } from './catalog-item.js';
import { InvalidCatalogItemError } from './errors.js';

describe('CatalogItem aggregate', () => {
  const itemId = '507f1f77bcf86cd799439020';

  describe('create', () => {
    test('when id and name are valid — creates active item with timestamps', () => {
      const item = CatalogItem.create({
        id: itemId,
        name: 'Widget',
        now: '2026-01-01T00:00:00.000Z',
      });

      expect(item.toSnapshot()).toEqual({
        id: itemId,
        name: 'Widget',
        active: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      });
    });

    test('when active is omitted — defaults to true', () => {
      const item = CatalogItem.create({
        id: itemId,
        name: 'Widget',
        now: '2026-01-01T00:00:00.000Z',
      });

      expect(item.toSnapshot().active).toBe(true);
    });

    test('when active is false — stores inactive', () => {
      const item = CatalogItem.create({
        id: itemId,
        name: 'Widget',
        active: false,
        now: '2026-01-01T00:00:00.000Z',
      });

      expect(item.toSnapshot().active).toBe(false);
    });

    test('when name has surrounding whitespace — trims it', () => {
      const item = CatalogItem.create({
        id: itemId,
        name: '  Widget  ',
        now: '2026-01-01T00:00:00.000Z',
      });

      expect(item.toSnapshot().name).toBe('Widget');
    });

    test('when id is blank — throws InvalidCatalogItemError', () => {
      expect(() => CatalogItem.create({ id: '   ', name: 'Widget' })).toThrow(
        InvalidCatalogItemError,
      );
      expect(() => CatalogItem.create({ id: '   ', name: 'Widget' })).toThrow(
        'Catalog item id is required',
      );
    });

    test('when name is blank — throws InvalidCatalogItemError', () => {
      expect(() => CatalogItem.create({ id: itemId, name: '   ' })).toThrow(
        InvalidCatalogItemError,
      );
      expect(() => CatalogItem.create({ id: itemId, name: '   ' })).toThrow(
        'Catalog item name is required',
      );
    });
  });

  describe('reconstitute', () => {
    test('when given a snapshot — restores the same values', () => {
      const snapshot = {
        id: itemId,
        name: 'Restored',
        active: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      };

      const item = CatalogItem.reconstitute(snapshot);

      expect(item.toSnapshot()).toEqual(snapshot);
    });
  });

  describe('rename', () => {
    test('when name is valid — updates name and touches updatedAt', () => {
      const item = CatalogItem.create({
        id: itemId,
        name: 'Widget',
        now: '2026-01-01T00:00:00.000Z',
      });

      item.rename('Gadget');

      const snapshot = item.toSnapshot();
      expect(snapshot.name).toBe('Gadget');
      expect(snapshot.updatedAt).not.toBe('2026-01-01T00:00:00.000Z');
      expect(snapshot.createdAt).toBe('2026-01-01T00:00:00.000Z');
    });

    test('when name has surrounding whitespace — trims it', () => {
      const item = CatalogItem.create({
        id: itemId,
        name: 'Widget',
        now: '2026-01-01T00:00:00.000Z',
      });

      item.rename('  Gadget  ');

      expect(item.toSnapshot().name).toBe('Gadget');
    });

    test('when name is blank — throws InvalidCatalogItemError', () => {
      const item = CatalogItem.create({
        id: itemId,
        name: 'Widget',
        now: '2026-01-01T00:00:00.000Z',
      });

      expect(() => item.rename('   ')).toThrow(InvalidCatalogItemError);
      expect(() => item.rename('   ')).toThrow('Catalog item name is required');
    });
  });

  describe('setActive', () => {
    test('when setting inactive — updates active and touches updatedAt', () => {
      const item = CatalogItem.create({
        id: itemId,
        name: 'Widget',
        now: '2026-01-01T00:00:00.000Z',
      });

      item.setActive(false);

      const snapshot = item.toSnapshot();
      expect(snapshot.active).toBe(false);
      expect(snapshot.updatedAt).not.toBe('2026-01-01T00:00:00.000Z');
      expect(snapshot.createdAt).toBe('2026-01-01T00:00:00.000Z');
    });

    test('when setting active true — updates active and touches updatedAt', () => {
      const item = CatalogItem.reconstitute({
        id: itemId,
        name: 'Widget',
        active: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      });

      item.setActive(true);

      const snapshot = item.toSnapshot();
      expect(snapshot.active).toBe(true);
      expect(snapshot.updatedAt).not.toBe('2026-01-01T00:00:00.000Z');
    });
  });

  describe('toSnapshot', () => {
    test('returns a shallow copy (mutating snapshot does not affect aggregate)', () => {
      const item = CatalogItem.create({
        id: itemId,
        name: 'Widget',
        now: '2026-01-01T00:00:00.000Z',
      });

      const snapshot = item.toSnapshot();
      snapshot.name = 'Mutated';
      snapshot.active = false;

      expect(item.toSnapshot().name).toBe('Widget');
      expect(item.toSnapshot().active).toBe(true);
    });
  });
});

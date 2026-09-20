import * as fc from 'fast-check';
import { CatalogItem } from './catalog-item.js';
import { InvalidCatalogItemError } from './errors.js';

const mongoIdArb = fc.stringMatching(/^[0-9a-f]{24}$/);
const nonEmptyNameArb = fc
  .string({ minLength: 1, maxLength: 80 })
  .filter((value) => value.trim().length > 0);

describe('CatalogItem aggregate properties', () => {
  // Property: blank ids always reject
  test('blank ids always throw InvalidCatalogItemError', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('', ' ', '   ', '\t', '\n'),
        nonEmptyNameArb,
        (blank, name) => {
          expect(() => CatalogItem.create({ id: blank, name })).toThrow(
            InvalidCatalogItemError,
          );
        },
      ),
      { numRuns: 20 },
    );
  });

  // Property: blank names always reject
  test('blank names always throw InvalidCatalogItemError', () => {
    fc.assert(
      fc.property(
        mongoIdArb,
        fc.constantFrom('', ' ', '   ', '\t', '\n'),
        (id, blank) => {
          expect(() => CatalogItem.create({ id, name: blank })).toThrow(
            InvalidCatalogItemError,
          );
        },
      ),
      { numRuns: 20 },
    );
  });

  // Property: create → reconstitute round-trip preserves snapshot
  test('create then reconstitute preserves snapshot fields', () => {
    fc.assert(
      fc.property(mongoIdArb, nonEmptyNameArb, fc.boolean(), (id, name, active) => {
        const created = CatalogItem.create({
          id,
          name,
          active,
          now: '2026-01-01T00:00:00.000Z',
        });
        const snapshot = created.toSnapshot();
        const restored = CatalogItem.reconstitute(snapshot);
        expect(restored.toSnapshot()).toEqual(snapshot);
      }),
      { numRuns: 100 },
    );
  });

  // Property: rename with blank name always rejects
  test('rename with blank name always throws InvalidCatalogItemError', () => {
    fc.assert(
      fc.property(
        mongoIdArb,
        nonEmptyNameArb,
        fc.constantFrom('', ' ', '   ', '\t', '\n'),
        (id, name, blank) => {
          const item = CatalogItem.create({
            id,
            name,
            now: '2026-01-01T00:00:00.000Z',
          });
          expect(() => item.rename(blank)).toThrow(InvalidCatalogItemError);
        },
      ),
      { numRuns: 20 },
    );
  });

  // Property: setActive then reconstitute preserves active flag
  test('setActive then reconstitute preserves active', () => {
    fc.assert(
      fc.property(mongoIdArb, nonEmptyNameArb, fc.boolean(), (id, name, active) => {
        const item = CatalogItem.create({
          id,
          name,
          now: '2026-01-01T00:00:00.000Z',
        });
        item.setActive(active);
        const snapshot = item.toSnapshot();
        expect(CatalogItem.reconstitute(snapshot).toSnapshot().active).toBe(
          active,
        );
      }),
      { numRuns: 100 },
    );
  });
});

import * as fc from 'fast-check';
import { MediaFile } from './media-file.js';
import { InvalidMediaFileError } from './errors.js';

const mongoIdArb = fc.stringMatching(/^[0-9a-f]{24}$/);
const optionalTextArb = fc.option(
  fc.string({ minLength: 0, maxLength: 80 }),
  { nil: undefined },
);

describe('MediaFile aggregate properties', () => {
  // Property: blank ids always reject
  test('blank ids always throw InvalidMediaFileError', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('', ' ', '   ', '\t', '\n'),
        (blank) => {
          expect(() => MediaFile.create({ id: blank })).toThrow(
            InvalidMediaFileError,
          );
        },
      ),
      { numRuns: 20 },
    );
  });

  // Property: create → reconstitute round-trip preserves snapshot
  test('create then reconstitute preserves snapshot fields', () => {
    fc.assert(
      fc.property(
        mongoIdArb,
        optionalTextArb,
        optionalTextArb,
        (id, fileName, url) => {
          const created = MediaFile.create({
            id,
            fileName,
            url,
            now: '2026-01-01T00:00:00.000Z',
          });
          const snapshot = created.toSnapshot();
          const restored = MediaFile.reconstitute(snapshot);
          expect(restored.toSnapshot()).toEqual(snapshot);
        },
      ),
      { numRuns: 100 },
    );
  });

  // Property: softDelete is idempotent
  test('softDelete twice leaves the same snapshot as softDelete once', () => {
    fc.assert(
      fc.property(mongoIdArb, optionalTextArb, (id, fileName) => {
        const once = MediaFile.create({
          id,
          fileName,
          now: '2026-01-01T00:00:00.000Z',
        });
        once.softDelete();
        const afterOnce = once.toSnapshot();

        const twice = MediaFile.reconstitute(afterOnce);
        twice.softDelete();
        expect(twice.toSnapshot()).toEqual(afterOnce);
      }),
      { numRuns: 100 },
    );
  });
});

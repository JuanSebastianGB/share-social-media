import { MediaFile } from './media-file.js';
import { InvalidMediaFileError } from './errors.js';

describe('MediaFile aggregate', () => {
  const fileId = '507f1f77bcf86cd799439014';

  describe('create', () => {
    test('when id is valid — creates undeleted media file with timestamps', () => {
      const file = MediaFile.create({
        id: fileId,
        fileName: 'photo.png',
        url: 'https://cdn.example/photo.png',
        now: '2026-01-01T00:00:00.000Z',
      });

      expect(file.toSnapshot()).toEqual({
        id: fileId,
        fileName: 'photo.png',
        url: 'https://cdn.example/photo.png',
        deleted: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      });
    });

    test('when optional fields omitted — creates with deleted false', () => {
      const file = MediaFile.create({
        id: fileId,
        now: '2026-01-01T00:00:00.000Z',
      });

      expect(file.toSnapshot()).toEqual({
        id: fileId,
        fileName: undefined,
        url: undefined,
        deleted: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      });
    });

    test('when fileName has surrounding whitespace — trims it', () => {
      const file = MediaFile.create({
        id: fileId,
        fileName: '  photo.png  ',
        now: '2026-01-01T00:00:00.000Z',
      });

      expect(file.toSnapshot().fileName).toBe('photo.png');
    });

    test('when fileName is blank after trim — stores undefined', () => {
      const file = MediaFile.create({
        id: fileId,
        fileName: '   ',
        now: '2026-01-01T00:00:00.000Z',
      });

      expect(file.toSnapshot().fileName).toBeUndefined();
    });

    test('when url is blank after trim — stores undefined', () => {
      const file = MediaFile.create({
        id: fileId,
        url: '   ',
        now: '2026-01-01T00:00:00.000Z',
      });

      expect(file.toSnapshot().url).toBeUndefined();
    });

    test('when ownerId is set — stores it on the snapshot', () => {
      const file = MediaFile.create({
        id: fileId,
        ownerId: '507f1f77bcf86cd799439011',
        now: '2026-01-01T00:00:00.000Z',
      });

      expect(file.toSnapshot().ownerId).toBe('507f1f77bcf86cd799439011');
    });

    test('when id is blank — throws InvalidMediaFileError', () => {
      expect(() => MediaFile.create({ id: '   ' })).toThrow(
        InvalidMediaFileError,
      );
      expect(() => MediaFile.create({ id: '   ' })).toThrow(
        'Media file id is required',
      );
    });
  });

  describe('reconstitute', () => {
    test('when given a snapshot — restores the same values', () => {
      const snapshot = {
        id: fileId,
        fileName: 'restored.png',
        url: 'https://cdn.example/restored.png',
        deleted: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      };

      const file = MediaFile.reconstitute(snapshot);

      expect(file.toSnapshot()).toEqual(snapshot);
    });
  });

  describe('softDelete', () => {
    test('when not deleted — marks deleted and touches updatedAt', () => {
      const file = MediaFile.create({
        id: fileId,
        fileName: 'photo.png',
        now: '2026-01-01T00:00:00.000Z',
      });

      file.softDelete();

      const snapshot = file.toSnapshot();
      expect(snapshot.deleted).toBe(true);
      expect(snapshot.updatedAt).not.toBe('2026-01-01T00:00:00.000Z');
      expect(snapshot.createdAt).toBe('2026-01-01T00:00:00.000Z');
    });

    test('when already deleted — is idempotent (no-op)', () => {
      const file = MediaFile.reconstitute({
        id: fileId,
        fileName: 'photo.png',
        url: 'https://cdn.example/photo.png',
        deleted: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      });

      file.softDelete();

      expect(file.toSnapshot()).toEqual({
        id: fileId,
        fileName: 'photo.png',
        url: 'https://cdn.example/photo.png',
        deleted: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      });
    });
  });

  describe('toSnapshot', () => {
    test('returns a shallow copy (mutating snapshot does not affect aggregate)', () => {
      const file = MediaFile.create({
        id: fileId,
        fileName: 'photo.png',
        now: '2026-01-01T00:00:00.000Z',
      });

      const snapshot = file.toSnapshot();
      snapshot.fileName = 'mutated.png';
      snapshot.deleted = true;

      expect(file.toSnapshot().fileName).toBe('photo.png');
      expect(file.toSnapshot().deleted).toBe(false);
    });
  });
});

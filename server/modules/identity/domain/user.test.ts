import { User } from './user.js';
import { InvalidUserError } from './errors.js';

describe('User aggregate', () => {
  const userId = '507f1f77bcf86cd799439011';
  const friendId = '507f1f77bcf86cd799439012';

  describe('create', () => {
    test('when id and email are valid — creates user with defaults', () => {
      const user = User.create({
        id: userId,
        email: 'ada@example.com',
        firstName: 'Ada',
        lastName: 'Lovelace',
        now: '2026-01-01T00:00:00.000Z',
      });

      expect(user.toSnapshot()).toEqual({
        id: userId,
        email: 'ada@example.com',
        firstName: 'Ada',
        lastName: 'Lovelace',
        username: undefined,
        location: undefined,
        occupation: undefined,
        role: 'user',
        friends: [],
        password: undefined,
        cognitoSub: undefined,
        age: undefined,
        viewedProfile: undefined,
        impressions: undefined,
        profileImageId: undefined,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      });
    });

    test('when email has mixed case and whitespace — normalizes like emailGsi1Pk', () => {
      const user = User.create({
        id: userId,
        email: '  Ada@Example.COM  ',
        now: '2026-01-01T00:00:00.000Z',
      });

      expect(user.toSnapshot().email).toBe('ada@example.com');
    });

    test('when firstName and lastName are omitted — leaves them undefined', () => {
      const user = User.create({
        id: userId,
        email: 'ada@example.com',
        now: '2026-01-01T00:00:00.000Z',
      });

      expect(user.toSnapshot().firstName).toBeUndefined();
      expect(user.toSnapshot().lastName).toBeUndefined();
    });

    test('when id is blank — throws InvalidUserError', () => {
      expect(() =>
        User.create({ id: '   ', email: 'ada@example.com' }),
      ).toThrow(InvalidUserError);
    });

    test('when email is blank — throws InvalidUserError', () => {
      expect(() => User.create({ id: userId, email: '   ' })).toThrow(
        InvalidUserError,
      );
    });

    test('when role and friends are provided — uses them', () => {
      const user = User.create({
        id: userId,
        email: 'ada@example.com',
        role: ['admin', 'user'],
        friends: [friendId],
        now: '2026-01-01T00:00:00.000Z',
      });

      expect(user.toSnapshot().role).toEqual(['admin', 'user']);
      expect(user.toSnapshot().friends).toEqual([friendId]);
    });

    test('when password is provided — stores opaque hash string as-is', () => {
      const user = User.create({
        id: userId,
        email: 'ada@example.com',
        password: '$2a$10$opaquehash',
        now: '2026-01-01T00:00:00.000Z',
      });

      expect(user.toSnapshot().password).toBe('$2a$10$opaquehash');
    });
  });

  describe('reconstitute', () => {
    test('when given a snapshot — restores the same values and copies friends', () => {
      const snapshot = {
        id: userId,
        email: 'ada@example.com',
        firstName: 'Ada',
        lastName: 'Lovelace',
        role: 'user' as const,
        friends: [friendId],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      };

      const user = User.reconstitute(snapshot);
      const restored = user.toSnapshot();

      expect(restored).toEqual(snapshot);
      restored.friends.push('mutated');
      expect(user.toSnapshot().friends).toEqual([friendId]);
    });
  });

  describe('toSnapshot', () => {
    test('when friends array is mutated — aggregate state is unchanged', () => {
      const user = User.create({
        id: userId,
        email: 'ada@example.com',
        friends: [friendId],
        now: '2026-01-01T00:00:00.000Z',
      });

      const snapshot = user.toSnapshot();
      snapshot.friends.push('mutated');
      snapshot.email = 'mutated@example.com';

      expect(user.toSnapshot().friends).toEqual([friendId]);
      expect(user.toSnapshot().email).toBe('ada@example.com');
    });
  });
});

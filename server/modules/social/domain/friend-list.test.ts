import { FriendList } from './friend-list.js';
import { InvalidFriendListError } from './errors.js';

describe('FriendList aggregate', () => {
  const userId = '507f1f77bcf86cd799439011';
  const friendId = '507f1f77bcf86cd799439012';

  describe('create', () => {
    test('when userId is valid — creates empty friend list with timestamps', () => {
      const list = FriendList.create({
        userId,
        now: '2026-01-01T00:00:00.000Z',
      });

      expect(list.toSnapshot()).toEqual({
        userId,
        friends: [],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      });
    });

    test('when friends are provided — copies them', () => {
      const list = FriendList.create({
        userId,
        friends: [friendId],
        now: '2026-01-01T00:00:00.000Z',
      });

      expect(list.toSnapshot().friends).toEqual([friendId]);
    });

    test('when userId is blank — throws InvalidFriendListError', () => {
      expect(() => FriendList.create({ userId: '   ' })).toThrow(
        InvalidFriendListError,
      );
      expect(() => FriendList.create({ userId: '   ' })).toThrow(
        'User id is required',
      );
    });
  });

  describe('reconstitute', () => {
    test('when given a snapshot — restores values and copies friends', () => {
      const snapshot = {
        userId,
        friends: [friendId],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      };

      const list = FriendList.reconstitute(snapshot);
      const restored = list.toSnapshot();

      expect(restored).toEqual(snapshot);
      restored.friends.push('mutated');
      expect(list.toSnapshot().friends).toEqual([friendId]);
    });
  });

  describe('toggleFriend', () => {
    test('when friend is not present — adds friendId', () => {
      const list = FriendList.create({
        userId,
        now: '2026-01-01T00:00:00.000Z',
      });

      list.toggleFriend(friendId);

      expect(list.toSnapshot().friends).toEqual([friendId]);
    });

    test('when friend is already present — removes friendId', () => {
      const list = FriendList.create({
        userId,
        friends: [friendId],
        now: '2026-01-01T00:00:00.000Z',
      });

      list.toggleFriend(friendId);

      expect(list.toSnapshot().friends).toEqual([]);
    });

    test('when friendId is blank — throws InvalidFriendListError', () => {
      const list = FriendList.create({ userId });

      expect(() => list.toggleFriend('   ')).toThrow(InvalidFriendListError);
      expect(() => list.toggleFriend('   ')).toThrow('Friend id is required');
    });

    test('when friendId is self — throws InvalidFriendListError', () => {
      const list = FriendList.create({ userId });

      expect(() => list.toggleFriend(userId)).toThrow(InvalidFriendListError);
      expect(() => list.toggleFriend(userId)).toThrow('Cannot friend yourself');
    });

    test('when friends change — touches updatedAt', () => {
      const list = FriendList.create({
        userId,
        now: '2026-01-01T00:00:00.000Z',
      });

      list.toggleFriend(friendId);

      expect(list.toSnapshot().updatedAt).not.toBe(
        '2026-01-01T00:00:00.000Z',
      );
      expect(list.toSnapshot().createdAt).toBe('2026-01-01T00:00:00.000Z');
    });
  });

  describe('toSnapshot', () => {
    test('when friends array is mutated — aggregate state is unchanged', () => {
      const list = FriendList.create({
        userId,
        friends: [friendId],
        now: '2026-01-01T00:00:00.000Z',
      });

      const snapshot = list.toSnapshot();
      snapshot.friends.push('mutated');
      snapshot.userId = 'mutated';

      expect(list.toSnapshot().friends).toEqual([friendId]);
      expect(list.toSnapshot().userId).toBe(userId);
    });
  });
});

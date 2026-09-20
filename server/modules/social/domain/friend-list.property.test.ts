import * as fc from 'fast-check';
import { FriendList } from './friend-list.js';
import { InvalidFriendListError } from './errors.js';

const mongoIdArb = fc.stringMatching(/^[0-9a-f]{24}$/);

describe('FriendList aggregate properties', () => {
  // Property: for any valid peer id, toggling friend twice restores membership
  test('toggling friend twice restores friends membership', () => {
    fc.assert(
      fc.property(mongoIdArb, mongoIdArb, (userId, friendId) => {
        fc.pre(userId !== friendId);
        const list = FriendList.create({
          userId,
          now: '2026-01-01T00:00:00.000Z',
        });
        const before = [...list.toSnapshot().friends];
        list.toggleFriend(friendId);
        list.toggleFriend(friendId);
        expect(list.toSnapshot().friends).toEqual(before);
      }),
      { numRuns: 100 },
    );
  });

  // Property: create then reconstitute round-trips snapshot fields
  test('create round-trips via reconstitute', () => {
    fc.assert(
      fc.property(mongoIdArb, (userId) => {
        const list = FriendList.create({
          userId,
          now: '2026-01-01T00:00:00.000Z',
        });
        const snapshot = list.toSnapshot();
        expect(FriendList.reconstitute(snapshot).toSnapshot()).toEqual(
          snapshot,
        );
      }),
      { numRuns: 100 },
    );
  });

  // Property: toSnapshot and reconstitute always copy the friends array
  test('friends array is copied on toSnapshot and reconstitute', () => {
    fc.assert(
      fc.property(
        mongoIdArb,
        fc.uniqueArray(mongoIdArb, { minLength: 0, maxLength: 5 }),
        (userId, friends) => {
          const filtered = friends.filter((friendId) => friendId !== userId);
          const list = FriendList.reconstitute({
            userId,
            friends: filtered,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          });
          const snapshot = list.toSnapshot();
          snapshot.friends.push('mutated');
          expect(list.toSnapshot().friends).toEqual(filtered);
        },
      ),
      { numRuns: 100 },
    );
  });

  // Property: blank user ids always reject
  test('blank userIds always throw InvalidFriendListError', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('', ' ', '   ', '\t', '\n'),
        (blank) => {
          expect(() => FriendList.create({ userId: blank })).toThrow(
            InvalidFriendListError,
          );
        },
      ),
      { numRuns: 20 },
    );
  });

  // Property: blank friend ids always reject on toggle
  test('blank friendIds always throw InvalidFriendListError', () => {
    fc.assert(
      fc.property(
        mongoIdArb,
        fc.constantFrom('', ' ', '   ', '\t', '\n'),
        (userId, blank) => {
          const list = FriendList.create({ userId });
          expect(() => list.toggleFriend(blank)).toThrow(
            InvalidFriendListError,
          );
        },
      ),
      { numRuns: 50 },
    );
  });

  // Property: self-friend always rejects
  test('self friendId always throws InvalidFriendListError', () => {
    fc.assert(
      fc.property(mongoIdArb, (userId) => {
        const list = FriendList.create({ userId });
        expect(() => list.toggleFriend(userId)).toThrow(
          InvalidFriendListError,
        );
      }),
      { numRuns: 50 },
    );
  });
});

import { friendsEmptyState } from '@/models';
import type { UserApiModel } from '@/models';
import { describe, expect, it } from 'vitest';
import { makeLogout } from './authSlice';
import friendsReducer, {
  removeFriend,
  setFriends,
  toggleFriend,
} from './friendsSlice';

const makeFriend = (overrides: Partial<UserApiModel> = {}): UserApiModel =>
  ({
    _id: 'friend-1',
    firstName: 'Bob',
    lastName: 'Lee',
    ...overrides,
  }) as UserApiModel;

// Captured on: 2026-09-20 from feat/client-unit-tests
// Known bugs: none recorded

// characterization: documents current behavior, NOT intended spec
describe('friendsSlice characterization', () => {
  it('setFriends with list — replaces friends on state', () => {
    // Arrange
    const previous = { ...friendsEmptyState };
    const friends = [makeFriend()];

    // Act
    const next = friendsReducer(previous, setFriends({ friends }));

    // Assert
    expect(next.friends).toEqual(friends);
  });

  it('removeFriend by id — filters that friend out of the list', () => {
    // Arrange
    const previous = {
      friends: [makeFriend({ _id: 'a' }), makeFriend({ _id: 'b' })],
    };

    // Act
    const next = friendsReducer(previous, removeFriend('a'));

    // Assert
    expect(next.friends.map((f) => f._id)).toEqual(['b']);
  });

  it('toggleFriend with payload list — replaces friends with payload', () => {
    // Arrange
    const previous = { friends: [makeFriend({ _id: 'old' })] };
    const payload = [makeFriend({ _id: 'new' })];

    // Act
    const next = friendsReducer(previous, toggleFriend(payload));

    // Assert
    expect(next.friends).toEqual(payload);
  });

  it('makeLogout while friends populated — resets to friendsEmptyState', () => {
    // Arrange
    const previous = { friends: [makeFriend()] };

    // Act
    const next = friendsReducer(previous, makeLogout({}));

    // Assert
    expect(next).toEqual(friendsEmptyState);
  });
});

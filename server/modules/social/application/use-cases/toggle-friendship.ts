import type { FriendList } from '../../domain/friend-list.js';
import type { FriendListRepository } from '../ports/friend-list-repository.js';

/**
 * Bidirectional friend toggle matching legacy `toggleRelationFriendService`.
 * Throws `USER_OR_FRIEND_NOT_FOUND` when either FriendList is missing
 * (controller maps to ERROR_TOGGLE_FRIEND 404).
 */
export async function toggleFriendship(
  repo: FriendListRepository,
  actorId: string,
  friendId: string,
): Promise<FriendList> {
  const actor = await repo.findByUserId(actorId);
  const friend = await repo.findByUserId(friendId);
  if (!actor || !friend) {
    throw new Error('USER_OR_FRIEND_NOT_FOUND');
  }

  actor.toggleFriend(friendId);
  friend.toggleFriend(actorId);
  await repo.save(actor);
  await repo.save(friend);
  return actor;
}

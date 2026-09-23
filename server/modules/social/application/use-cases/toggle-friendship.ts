import type { FriendList } from '../../domain/friend-list.js';
import { UserOrFriendNotFoundError } from '../../domain/errors.js';
import type { FriendListRepository } from '../ports/friend-list-repository.js';

/**
 * Bidirectional friend toggle matching legacy `toggleRelationFriendService`.
 * Throws UserOrFriendNotFoundError when either FriendList is missing
 * (errorMapper maps to 404 + 'ERROR_TOGGLE_FRIEND' via the route's
 * defaultErrorCode stamp).
 */
export async function toggleFriendship(
  repo: FriendListRepository,
  actorId: string,
  friendId: string,
): Promise<FriendList> {
  const actor = await repo.findByUserId(actorId);
  const friend = await repo.findByUserId(friendId);
  if (!actor || !friend) {
    throw new UserOrFriendNotFoundError();
  }

  actor.toggleFriend(friendId);
  friend.toggleFriend(actorId);
  await repo.save(actor);
  await repo.save(friend);
  return actor;
}
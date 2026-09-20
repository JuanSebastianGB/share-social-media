import type { User } from '../../domain/user.js';
import type { UserRepository } from '../ports/user-repository.js';

/**
 * Bidirectional friend toggle matching legacy `toggleRelationFriendService`.
 * Throws `USER_OR_FRIEND_NOT_FOUND` when either aggregate is missing
 * (controller maps to ERROR_TOGGLE_FRIEND 404).
 */
export async function toggleFriendship(
  repo: UserRepository,
  actorId: string,
  friendId: string,
): Promise<User> {
  const actor = await repo.findById(actorId);
  const friend = await repo.findById(friendId);
  if (!actor || !friend) {
    throw new Error('USER_OR_FRIEND_NOT_FOUND');
  }

  actor.toggleFriend(friendId);
  friend.toggleFriend(actorId);
  await repo.save(actor);
  await repo.save(friend);
  return actor;
}

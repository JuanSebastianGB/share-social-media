import { getUserService } from '../../identity/index.js';
import { DynamoFriendListRepository } from '../infrastructure/dynamodb-friend-list-repository.js';
import { toggleFriendship as toggleFriendshipUseCase } from './use-cases/toggle-friendship.js';

const friendListRepository = new DynamoFriendListRepository();

/**
 * Hydrated friends list for legacy GET /users/:id/friends.
 * Missing FriendList (no USER profile) → empty array, matching Identity legacy.
 */
export async function getUserFriendsService(id: string) {
  const list = await friendListRepository.findByUserId(id);
  if (!list) return [];
  return await Promise.all(
    list
      .toSnapshot()
      .friends.map(async (friendId: string) => getUserService(friendId)),
  );
}

/**
 * Bidirectional toggle then return hydrated actor friends list
 * (legacy PATCH /users/:id/:friendId response shape).
 */
export async function toggleRelationFriendService(
  id: string,
  friendId: string,
) {
  await toggleFriendshipUseCase(friendListRepository, id, friendId);
  return await getUserFriendsService(id);
}

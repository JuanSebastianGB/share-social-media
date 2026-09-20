import type { FriendList } from '../../domain/friend-list.js';

/**
 * Persistence port for the FriendList aggregate (Social graph BC).
 * Friendship changes go through domain mutation then `save` — no `update()` on the port.
 * Persists as embedded `friends[]` on the existing USER Dynamo item (no FRIEND# edges).
 */
export interface FriendListRepository {
  save(friendList: FriendList): Promise<void>;
  findByUserId(userId: string): Promise<FriendList | null>;
}

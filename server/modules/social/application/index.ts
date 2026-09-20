/**
 * Social graph application barrel.
 */
export type { FriendListRepository } from './ports/friend-list-repository.js';
export {
  getUserFriendsService,
  toggleRelationFriendService,
} from './composition.js';
export { toggleFriendship } from './use-cases/toggle-friendship.js';

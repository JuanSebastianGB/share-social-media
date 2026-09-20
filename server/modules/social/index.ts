/**
 * Social graph bounded context public facade.
 */
export { DomainError, InvalidFriendListError } from './domain/errors.js';
export { FriendList } from './domain/friend-list.js';
export type {
  FriendListSnapshot,
  CreateFriendListInput,
} from './domain/friend-list.js';
export type { FriendListRepository } from './application/ports/friend-list-repository.js';
export { DynamoFriendListRepository } from './infrastructure/dynamodb-friend-list-repository.js';
export { InMemoryFriendListRepository } from './infrastructure/in-memory-friend-list-repository.js';
export {
  getUserFriendsService,
  toggleRelationFriendService,
} from './application/composition.js';
export { toggleFriendship } from './application/use-cases/toggle-friendship.js';

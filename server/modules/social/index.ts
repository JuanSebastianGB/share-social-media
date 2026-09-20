/**
 * Social graph bounded context public facade.
 * Scaffolding — use cases and composition wire land in later tasks.
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

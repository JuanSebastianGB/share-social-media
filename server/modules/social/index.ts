/**
 * Social graph bounded context public facade.
 * Scaffolding only — use cases and adapters are wired as the strangler migration progresses.
 */
export { DomainError, InvalidFriendListError } from './domain/errors.js';
export { FriendList } from './domain/friend-list.js';
export type {
  FriendListSnapshot,
  CreateFriendListInput,
} from './domain/friend-list.js';

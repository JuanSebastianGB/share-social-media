/**
 * Legacy users service facade — Identity for profiles; Social for friendship.
 * Prefer importing from `modules/identity` / `modules/social` for new code.
 */
export {
  getUsersService,
  getUserService,
  getUserFromEmailService,
} from '../modules/identity/index.js';

export {
  getUserFriendsService,
  toggleRelationFriendService,
} from '../modules/social/index.js';

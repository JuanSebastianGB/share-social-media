/**
 * Legacy users service facade — delegates to the Identity bounded context.
 * Prefer importing from `modules/identity` for new code.
 */
export {
  getUsersService,
  getUserService,
  getUserFriendsService,
  toggleRelationFriendService,
  getUserFromEmailService,
} from '../modules/identity/index.js';

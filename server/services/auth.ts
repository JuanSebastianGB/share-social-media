/**
 * Legacy auth service facade — delegates to the Identity bounded context.
 * Prefer importing from `modules/identity` for new code.
 */
export {
  registerService,
  completeProfileService,
  getUserByCognitoSubService,
} from '../modules/identity/index.js';

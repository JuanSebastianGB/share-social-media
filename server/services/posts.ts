/**
 * Legacy posts service facade — delegates to the Feed bounded context.
 * Prefer importing from `modules/feed` for new code.
 */
export {
  createPostService,
  toggleLikePostService,
  deletePostService,
  getPostsService,
  getPostsPaginationService,
  getPostService,
  getUserPostsService,
  countPostsService,
} from '../modules/feed/index.js';

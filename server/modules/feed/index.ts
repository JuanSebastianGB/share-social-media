/**
 * Feed bounded context public facade.
 */
export { InvalidPostError, DomainError } from './domain/errors.js';
export { Post } from './domain/post.js';
export type { PostSnapshot, CreatePostInput } from './domain/post.js';
export type { PostRepository } from './application/ports/post-repository.js';
export { DynamoPostRepository } from './infrastructure/dynamodb-post-repository.js';
export { InMemoryPostRepository } from './infrastructure/in-memory-post-repository.js';
export {
  createPostService,
  toggleLikePostService,
  deletePostService,
  getPostsService,
  getPostsPaginationService,
  getPostService,
  getUserPostsService,
  countPostsService,
  findPostAggregate,
  toLegacyPostRecord,
} from './application/composition.js';

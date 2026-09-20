/**
 * Comments bounded context public facade.
 */
export { InvalidCommentError, DomainError } from './domain/errors.js';
export { Comment } from './domain/comment.js';
export type {
  CommentSnapshot,
  CreateCommentInput,
} from './domain/comment.js';
export type { CommentRepository } from './application/ports/comment-repository.js';
export { DynamoCommentRepository } from './infrastructure/dynamodb-comment-repository.js';
export { InMemoryCommentRepository } from './infrastructure/in-memory-comment-repository.js';
export {
  listCommentsService,
  getCommentService,
  createCommentService,
  createCommentOnPostService,
  updateCommentService,
  deleteCommentService,
  toLegacyCommentRecord,
} from './application/composition.js';

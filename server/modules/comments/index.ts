/**
 * Comments bounded context public facade.
 * Scaffolding only — use cases and adapters are wired as the strangler migration progresses.
 */

export { InvalidCommentError, DomainError } from './domain/errors.js';
export { Comment } from './domain/comment.js';
export type {
  CommentSnapshot,
  CreateCommentInput,
} from './domain/comment.js';

import type { Comment } from '../../domain/comment.js';

/**
 * Persistence port for the Comment aggregate (Comments BC).
 * Updates go through domain `updateDescription` then `save` — no `update()` on the port.
 */
export interface CommentRepository {
  save(comment: Comment): Promise<void>;
  findById(id: string): Promise<Comment | null>;
  /** Returns false when the comment does not exist. */
  delete(id: string): Promise<boolean>;
  /**
   * All comments. Order is not guaranteed (mirrors legacy DynamoDB Scan).
   */
  list(): Promise<Comment[]>;
}

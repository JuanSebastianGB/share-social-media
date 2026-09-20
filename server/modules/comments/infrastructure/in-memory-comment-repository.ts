import { Comment } from '../domain/comment.js';
import type { CommentRepository } from '../application/ports/comment-repository.js';

/**
 * In-memory CommentRepository for unit tests and local fakes.
 */
export class InMemoryCommentRepository implements CommentRepository {
  private readonly comments = new Map<string, Comment>();

  async save(comment: Comment): Promise<void> {
    const snapshot = comment.toSnapshot();
    this.comments.set(snapshot.id, Comment.reconstitute(snapshot));
  }

  async findById(id: string): Promise<Comment | null> {
    const comment = this.comments.get(id);
    return comment ? Comment.reconstitute(comment.toSnapshot()) : null;
  }

  async delete(id: string): Promise<boolean> {
    return this.comments.delete(id);
  }

  /**
   * Returns all comments. Order is not guaranteed (mirrors legacy DynamoDB Scan).
   */
  async list(): Promise<Comment[]> {
    return [...this.comments.values()].map((comment) =>
      Comment.reconstitute(comment.toSnapshot()),
    );
  }

  clear(): void {
    this.comments.clear();
  }
}

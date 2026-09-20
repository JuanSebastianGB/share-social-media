import type { CommentRepository } from '../ports/comment-repository.js';
import type { Comment } from '../../domain/comment.js';

export async function getComment(
  repo: CommentRepository,
  id: string,
): Promise<Comment | null> {
  return repo.findById(id);
}

import type { CommentRepository } from '../ports/comment-repository.js';
import type { Comment } from '../../domain/comment.js';

export async function listComments(
  repo: CommentRepository,
): Promise<Comment[]> {
  return repo.list();
}

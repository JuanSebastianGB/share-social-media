import type { CommentRepository } from '../ports/comment-repository.js';
import type { DeleteResult } from '../../../../types/entities.js';

export async function deleteComment(
  repo: CommentRepository,
  id: string,
): Promise<DeleteResult> {
  const deleted = await repo.delete(id);
  return { acknowledged: true, deletedCount: deleted ? 1 : 0 };
}

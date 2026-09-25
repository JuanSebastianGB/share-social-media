import type { CommentRepository } from '../ports/comment-repository.js';
import { NotResourceOwnerError } from '../../../shared/not-resource-owner-error.js';
import type { DeleteResult } from '../../../../types/entities.js';

/**
 * Deletes a comment owned by `callerId`.
 * Missing comment → deletedCount 0. A non-author is rejected before delete.
 */
export async function deleteComment(
  repo: CommentRepository,
  id: string,
  callerId: string,
): Promise<DeleteResult> {
  const existing = await repo.findById(id);
  if (!existing) {
    return { acknowledged: true, deletedCount: 0 };
  }

  if (existing.toSnapshot().authorId !== callerId) {
    throw new NotResourceOwnerError();
  }

  const deleted = await repo.delete(id);
  return { acknowledged: true, deletedCount: deleted ? 1 : 0 };
}

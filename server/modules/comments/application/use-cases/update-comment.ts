import type { CommentRepository } from '../ports/comment-repository.js';
import { Comment } from '../../domain/comment.js';
import { NotResourceOwnerError } from '../../../shared/not-resource-owner-error.js';
import type { UpdateResult } from '../../../../types/entities.js';

/**
 * Applies a legacy-style patch to a comment.
 * Description goes through domain `updateDescription`; names via `updateNames`.
 * Missing comment → matchedCount 0 (HTTP-compatible).
 * A non-author is rejected before any save.
 */
export async function updateComment(
  repo: CommentRepository,
  id: string,
  patch: Record<string, unknown>,
  callerId: string,
): Promise<UpdateResult> {
  const existing = await repo.findById(id);
  if (!existing) {
    return { acknowledged: true, matchedCount: 0, modifiedCount: 0 };
  }

  if (existing.toSnapshot().authorId !== callerId) {
    throw new NotResourceOwnerError();
  }

  const hasDescription = patch.description !== undefined;
  const hasNames =
    patch.firstName !== undefined || patch.lastName !== undefined;

  if (hasDescription) {
    existing.updateDescription(String(patch.description));
  }

  if (hasNames) {
    const snapshot = existing.toSnapshot();
    existing.updateNames(
      patch.firstName !== undefined
        ? String(patch.firstName)
        : snapshot.firstName,
      patch.lastName !== undefined ? String(patch.lastName) : snapshot.lastName,
    );
  }

  // Legacy UpdateCommand always bumps updatedAt even for empty patches.
  if (!hasDescription && !hasNames) {
    const snapshot = existing.toSnapshot();
    await repo.save(
      Comment.reconstitute({
        ...snapshot,
        updatedAt: new Date().toISOString(),
      }),
    );
  } else {
    await repo.save(existing);
  }

  return { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
}

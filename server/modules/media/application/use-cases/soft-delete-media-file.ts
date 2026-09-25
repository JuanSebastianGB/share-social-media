import type { DeleteResult } from '../../../../types/entities.js';
import { NotResourceOwnerError } from '../../../shared/not-resource-owner-error.js';
import type { MediaFileRepository } from '../ports/media-file-repository.js';

/**
 * Soft-deletes a media file owned by `callerId`.
 * Missing or already-deleted files return deletedCount 0.
 * A different caller, or a file with no owner, is rejected before mutation.
 */
export async function softDeleteMediaFile(
  repo: MediaFileRepository,
  id: string,
  callerId: string,
): Promise<DeleteResult> {
  const existing = await repo.findByIdIncludingDeleted(id);
  if (!existing || existing.toSnapshot().deleted) {
    return { acknowledged: true, deletedCount: 0 };
  }

  if (existing.toSnapshot().ownerId !== callerId) {
    throw new NotResourceOwnerError();
  }

  existing.softDelete();
  await repo.save(existing);
  return { acknowledged: true, deletedCount: 1 };
}

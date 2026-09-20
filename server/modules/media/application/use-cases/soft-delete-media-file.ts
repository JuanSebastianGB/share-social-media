import type { DeleteResult } from '../../../../types/entities.js';
import type { MediaFileRepository } from '../ports/media-file-repository.js';

/**
 * Soft-deletes a media file. Mirrors legacy softDeleteStorage deletedCount semantics.
 */
export async function softDeleteMediaFile(
  repo: MediaFileRepository,
  id: string,
): Promise<DeleteResult> {
  const existing = await repo.findByIdIncludingDeleted(id);
  if (!existing || existing.toSnapshot().deleted) {
    return { acknowledged: true, deletedCount: 0 };
  }

  existing.softDelete();
  await repo.save(existing);
  return { acknowledged: true, deletedCount: 1 };
}

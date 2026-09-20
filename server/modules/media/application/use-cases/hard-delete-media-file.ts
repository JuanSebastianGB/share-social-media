import type { DeleteResult } from '../../../../types/entities.js';
import type { MediaFileRepository } from '../ports/media-file-repository.js';
import type { MediaObjectStore } from '../ports/media-object-store.js';

/**
 * Hard-deletes metadata and best-effort removes the object-store blob.
 */
export async function hardDeleteMediaFile(
  repo: MediaFileRepository,
  objectStore: MediaObjectStore,
  id: string,
): Promise<DeleteResult> {
  const existing = await repo.findByIdIncludingDeleted(id);
  if (!existing) {
    return { acknowledged: true, deletedCount: 0 };
  }

  const url = existing.toSnapshot().url;
  if (url) {
    try {
      await objectStore.deleteObject(url);
    } catch {
      // Best-effort object cleanup; still remove Dynamo metadata
    }
  }

  const deleted = await repo.delete(id);
  return { acknowledged: true, deletedCount: deleted ? 1 : 0 };
}

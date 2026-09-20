import type { UpdateResult } from '../../../../types/entities.js';
import type { CatalogItemRepository } from '../ports/catalog-item-repository.js';

/**
 * Applies name/active from a legacy-style patch via domain rename/setActive.
 * Unknown keys and `_id` are ignored. Missing item → matchedCount 0.
 */
export async function updateCatalogItem(
  repo: CatalogItemRepository,
  id: string,
  patch: Record<string, unknown>,
): Promise<UpdateResult> {
  const existing = await repo.findById(id);
  if (!existing) {
    return { acknowledged: true, matchedCount: 0, modifiedCount: 0 };
  }

  if (typeof patch.name === 'string') {
    existing.rename(patch.name);
  }
  if (typeof patch.active === 'boolean') {
    existing.setActive(patch.active);
  }

  await repo.save(existing);
  return { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
}

import type { DeleteResult } from '../../../../types/entities.js';
import type { CatalogItemRepository } from '../ports/catalog-item-repository.js';

export async function deleteCatalogItem(
  repo: CatalogItemRepository,
  id: string,
): Promise<DeleteResult> {
  const deleted = await repo.delete(id);
  return { acknowledged: true, deletedCount: deleted ? 1 : 0 };
}

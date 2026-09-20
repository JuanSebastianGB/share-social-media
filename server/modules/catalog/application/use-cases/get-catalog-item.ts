import type { CatalogItem } from '../../domain/catalog-item.js';
import type { CatalogItemRepository } from '../ports/catalog-item-repository.js';

export async function getCatalogItem(
  repo: CatalogItemRepository,
  id: string,
): Promise<CatalogItem | null> {
  return repo.findById(id);
}

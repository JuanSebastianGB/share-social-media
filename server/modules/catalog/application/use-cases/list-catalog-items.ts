import type { CatalogItem } from '../../domain/catalog-item.js';
import type { CatalogItemRepository } from '../ports/catalog-item-repository.js';

export async function listCatalogItems(
  repo: CatalogItemRepository,
): Promise<CatalogItem[]> {
  return repo.list();
}

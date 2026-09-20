import type { ItemRecord } from '../../../types/entities.js';
import type { CatalogItemSnapshot } from '../domain/catalog-item.js';
import { DynamoCatalogItemRepository } from '../infrastructure/dynamodb-catalog-item-repository.js';
import { createCatalogItem as createCatalogItemUseCase } from './use-cases/create-catalog-item.js';
import { deleteCatalogItem as deleteCatalogItemUseCase } from './use-cases/delete-catalog-item.js';
import { getCatalogItem as getCatalogItemUseCase } from './use-cases/get-catalog-item.js';
import { listCatalogItems as listCatalogItemsUseCase } from './use-cases/list-catalog-items.js';
import { updateCatalogItem as updateCatalogItemUseCase } from './use-cases/update-catalog-item.js';

const catalogItemRepository = new DynamoCatalogItemRepository();

/** Legacy HTTP shape for Item / ITEM documents. */
export function toLegacyItemRecord(snapshot: CatalogItemSnapshot): ItemRecord {
  return {
    _id: snapshot.id,
    name: snapshot.name,
    active: snapshot.active,
    createdAt: snapshot.createdAt,
    updatedAt: snapshot.updatedAt,
  };
}

export async function listItemsService(): Promise<ItemRecord[]> {
  const items = await listCatalogItemsUseCase(catalogItemRepository);
  return items.map((item) => toLegacyItemRecord(item.toSnapshot()));
}

export async function getItemService(id: string): Promise<ItemRecord | null> {
  const item = await getCatalogItemUseCase(catalogItemRepository, id);
  if (!item) return null;
  return toLegacyItemRecord(item.toSnapshot());
}

export async function createItemService(
  data: Record<string, unknown>,
): Promise<ItemRecord> {
  const item = await createCatalogItemUseCase(catalogItemRepository, {
    id: data._id ? String(data._id) : undefined,
    name: String(data.name ?? ''),
    active: typeof data.active === 'boolean' ? data.active : undefined,
  });
  return toLegacyItemRecord(item.toSnapshot());
}

export async function updateItemService(
  id: string,
  patch: Record<string, unknown>,
) {
  return updateCatalogItemUseCase(catalogItemRepository, id, patch);
}

export async function deleteItemService(id: string) {
  return deleteCatalogItemUseCase(catalogItemRepository, id);
}

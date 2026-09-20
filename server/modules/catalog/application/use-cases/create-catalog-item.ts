import { generateId } from '../../../../db/ids.js';
import { CatalogItem } from '../../domain/catalog-item.js';
import type { CatalogItemRepository } from '../ports/catalog-item-repository.js';

export type CreateCatalogItemCommand = {
  name: string;
  active?: boolean;
  id?: string;
  now?: string;
};

export async function createCatalogItem(
  repo: CatalogItemRepository,
  command: CreateCatalogItemCommand,
): Promise<CatalogItem> {
  const item = CatalogItem.create({
    id: command.id ?? generateId(),
    name: command.name,
    active: command.active,
    now: command.now,
  });
  await repo.save(item);
  return item;
}

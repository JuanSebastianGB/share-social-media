/**
 * Catalog (Items) bounded context public facade.
 */

export { DomainError, InvalidCatalogItemError } from './domain/errors.js';
export { CatalogItem } from './domain/catalog-item.js';
export type {
  CatalogItemSnapshot,
  CreateCatalogItemInput,
} from './domain/catalog-item.js';
export type { CatalogItemRepository } from './application/ports/catalog-item-repository.js';
export { DynamoCatalogItemRepository } from './infrastructure/dynamodb-catalog-item-repository.js';
export { InMemoryCatalogItemRepository } from './infrastructure/in-memory-catalog-item-repository.js';
export {
  toLegacyItemRecord,
  listItemsService,
  getItemService,
  createItemService,
  updateItemService,
  deleteItemService,
} from './application/composition.js';

/**
 * Catalog application barrel.
 */

export type { CatalogItemRepository } from './ports/catalog-item-repository.js';
export {
  toLegacyItemRecord,
  listItemsService,
  getItemService,
  createItemService,
  updateItemService,
  deleteItemService,
} from './composition.js';
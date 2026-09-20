/**
 * Legacy items service facade — delegates to the Catalog bounded context.
 * Prefer importing from `modules/catalog` for new code.
 */
export {
  listItemsService,
  getItemService,
  createItemService,
  updateItemService,
  deleteItemService,
} from '../modules/catalog/index.js';

/**
 * Catalog (Items) bounded context public facade.
 * Domain aggregate lands in T2; use cases and adapters wire later.
 */

export { DomainError, InvalidCatalogItemError } from './domain/errors.js';
export { CatalogItem } from './domain/catalog-item.js';
export type {
  CatalogItemSnapshot,
  CreateCatalogItemInput,
} from './domain/catalog-item.js';

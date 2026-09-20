import type { CatalogItem } from '../../domain/catalog-item.js';

/**
 * Persistence port for the CatalogItem aggregate (Catalog BC).
 * Partial Dynamo UpdateResult semantics stay in application composition (T4).
 */
export interface CatalogItemRepository {
  save(item: CatalogItem): Promise<void>;
  findById(id: string): Promise<CatalogItem | null>;
  /** Order is not guaranteed (legacy Scan). */
  list(): Promise<CatalogItem[]>;
  /** Hard delete Dynamo row; return false if missing. */
  delete(id: string): Promise<boolean>;
}

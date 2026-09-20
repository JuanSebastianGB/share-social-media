import { CatalogItem } from '../domain/catalog-item.js';
import type { CatalogItemRepository } from '../application/ports/catalog-item-repository.js';

/**
 * In-memory CatalogItemRepository for unit tests and local fakes.
 */
export class InMemoryCatalogItemRepository implements CatalogItemRepository {
  private readonly items = new Map<string, CatalogItem>();

  async save(item: CatalogItem): Promise<void> {
    const snapshot = item.toSnapshot();
    this.items.set(snapshot.id, CatalogItem.reconstitute(snapshot));
  }

  async findById(id: string): Promise<CatalogItem | null> {
    const item = this.items.get(id);
    return item ? CatalogItem.reconstitute(item.toSnapshot()) : null;
  }

  /**
   * All items. Order is not guaranteed (mirrors legacy Scan).
   */
  async list(): Promise<CatalogItem[]> {
    return [...this.items.values()].map((item) =>
      CatalogItem.reconstitute(item.toSnapshot()),
    );
  }

  async delete(id: string): Promise<boolean> {
    return this.items.delete(id);
  }

  clear(): void {
    this.items.clear();
  }
}

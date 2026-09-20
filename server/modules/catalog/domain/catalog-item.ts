import { InvalidCatalogItemError } from './errors.js';

export type CatalogItemSnapshot = {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateCatalogItemInput = {
  id: string;
  name: string;
  active?: boolean;
  /** Injected clock for deterministic tests. */
  now?: string;
};

/**
 * CatalogItem aggregate root for the Catalog (Items) bounded context.
 * HTTP length limits stay in express-validator; domain requires non-empty name + id.
 */
export class CatalogItem {
  private constructor(private readonly props: CatalogItemSnapshot) {}

  static create(input: CreateCatalogItemInput): CatalogItem {
    if (!input.id.trim()) {
      throw new InvalidCatalogItemError('Catalog item id is required');
    }
    const name = input.name.trim();
    if (!name) {
      throw new InvalidCatalogItemError('Catalog item name is required');
    }

    const now = input.now ?? new Date().toISOString();
    return new CatalogItem({
      id: input.id,
      name,
      active: input.active ?? true,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(snapshot: CatalogItemSnapshot): CatalogItem {
    return new CatalogItem({ ...snapshot });
  }

  rename(name: string): void {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new InvalidCatalogItemError('Catalog item name is required');
    }
    this.props.name = trimmed;
    this.touch();
  }

  setActive(active: boolean): void {
    this.props.active = active;
    this.touch();
  }

  toSnapshot(): CatalogItemSnapshot {
    return { ...this.props };
  }

  private touch(): void {
    this.props.updatedAt = new Date().toISOString();
  }
}

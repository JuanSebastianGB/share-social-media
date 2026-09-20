import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { getDocClient } from '../../../db/client.js';
import { itemPk, SK, TABLE_NAME } from '../../../db/keys.js';
import { CatalogItem } from '../domain/catalog-item.js';
import type { CatalogItemSnapshot } from '../domain/catalog-item.js';
import type { CatalogItemRepository } from '../application/ports/catalog-item-repository.js';

/**
 * Maps a CatalogItem snapshot to the legacy DynamoDB ITEM item shape
 * (formerly `server/repositories/items.ts`).
 */
function toItem(snapshot: CatalogItemSnapshot): Record<string, unknown> {
  return {
    PK: itemPk(snapshot.id),
    SK: SK.META,
    entityType: 'ITEM',
    _id: snapshot.id,
    name: snapshot.name,
    active: snapshot.active,
    createdAt: snapshot.createdAt,
    updatedAt: snapshot.updatedAt,
  };
}

function fromItem(
  item: Record<string, unknown> | undefined,
): CatalogItem | null {
  if (!item || item.entityType !== 'ITEM') return null;

  return CatalogItem.reconstitute({
    id: String(item._id),
    name: String(item.name ?? ''),
    active: (item.active as boolean | undefined) ?? true,
    createdAt: String(item.createdAt ?? ''),
    updatedAt: String(item.updatedAt ?? item.createdAt ?? ''),
  });
}

/**
 * DynamoDB single-table adapter for the CatalogItem aggregate.
 * Preserves the legacy ITEM item shape formerly in `repositories/items.ts`.
 * Save uses Put (full replace), matching MediaFileRepository.
 */
export class DynamoCatalogItemRepository implements CatalogItemRepository {
  async save(item: CatalogItem): Promise<void> {
    const doc = getDocClient();
    await doc.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: toItem(item.toSnapshot()),
      }),
    );
  }

  async findById(id: string): Promise<CatalogItem | null> {
    const doc = getDocClient();
    const result = await doc.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: itemPk(id), SK: SK.META },
      }),
    );
    return fromItem(result.Item as Record<string, unknown> | undefined);
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.findById(id);
    if (!existing) return false;
    const doc = getDocClient();
    await doc.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { PK: itemPk(id), SK: SK.META },
      }),
    );
    return true;
  }

  /**
   * ITEM rows via Scan. Order is not guaranteed (legacy Scan).
   */
  async list(): Promise<CatalogItem[]> {
    const doc = getDocClient();
    const result = await doc.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'begins_with(#pk, :prefix) AND #sk = :sk',
        ExpressionAttributeNames: { '#pk': 'PK', '#sk': 'SK' },
        ExpressionAttributeValues: {
          ':prefix': 'ITEM#',
          ':sk': SK.META,
        },
      }),
    );
    return (result.Items || [])
      .map((item) => fromItem(item as Record<string, unknown>))
      .filter((catalogItem): catalogItem is CatalogItem => catalogItem != null);
  }
}

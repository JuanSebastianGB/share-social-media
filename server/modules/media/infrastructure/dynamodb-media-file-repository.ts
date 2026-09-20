import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { getDocClient } from '../../../db/client.js';
import { filePk, SK, TABLE_NAME } from '../../../db/keys.js';
import { MediaFile } from '../domain/media-file.js';
import type { MediaFileSnapshot } from '../domain/media-file.js';
import type { MediaFileRepository } from '../application/ports/media-file-repository.js';

/**
 * Maps a MediaFile snapshot to the legacy DynamoDB FILE item shape
 * (formerly `server/repositories/storage.ts`). Writes `fileName` only.
 */
function toItem(snapshot: MediaFileSnapshot): Record<string, unknown> {
  return {
    PK: filePk(snapshot.id),
    SK: SK.META,
    entityType: 'FILE',
    _id: snapshot.id,
    fileName: snapshot.fileName,
    url: snapshot.url,
    deleted: snapshot.deleted,
    createdAt: snapshot.createdAt,
    updatedAt: snapshot.updatedAt,
  };
}

function readFileName(item: Record<string, unknown>): string | undefined {
  const value =
    (item.fileName as string | undefined) ??
    (item.filename as string | undefined);
  return value === undefined || value === '' ? undefined : value;
}

function readUrl(item: Record<string, unknown>): string | undefined {
  const value = item.url as string | undefined;
  return value === undefined || value === '' ? undefined : value;
}

function fromItem(
  item: Record<string, unknown> | undefined,
  options: { includeDeleted: boolean },
): MediaFile | null {
  if (!item || item.entityType !== 'FILE') return null;
  const deleted = item.deleted === true;
  if (!options.includeDeleted && deleted) return null;

  return MediaFile.reconstitute({
    id: String(item._id),
    fileName: readFileName(item),
    url: readUrl(item),
    deleted,
    createdAt: String(item.createdAt ?? ''),
    updatedAt: String(item.updatedAt ?? item.createdAt ?? ''),
  });
}

/**
 * DynamoDB single-table adapter for the MediaFile aggregate.
 * Preserves the legacy FILE item shape formerly in `repositories/storage.ts`.
 */
export class DynamoMediaFileRepository implements MediaFileRepository {
  async save(file: MediaFile): Promise<void> {
    const doc = getDocClient();
    await doc.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: toItem(file.toSnapshot()),
      }),
    );
  }

  async findById(id: string): Promise<MediaFile | null> {
    const doc = getDocClient();
    const result = await doc.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: filePk(id), SK: SK.META },
      }),
    );
    return fromItem(result.Item as Record<string, unknown> | undefined, {
      includeDeleted: false,
    });
  }

  async findByIdIncludingDeleted(id: string): Promise<MediaFile | null> {
    const doc = getDocClient();
    const result = await doc.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: filePk(id), SK: SK.META },
      }),
    );
    return fromItem(result.Item as Record<string, unknown> | undefined, {
      includeDeleted: true,
    });
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.findByIdIncludingDeleted(id);
    if (!existing) return false;
    const doc = getDocClient();
    await doc.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { PK: filePk(id), SK: SK.META },
      }),
    );
    return true;
  }

  /**
   * Non-deleted FILE rows via Scan. Order is not guaranteed (legacy Scan).
   */
  async list(): Promise<MediaFile[]> {
    const doc = getDocClient();
    const result = await doc.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression:
          'begins_with(#pk, :prefix) AND #sk = :sk AND (attribute_not_exists(deleted) OR deleted = :false)',
        ExpressionAttributeNames: { '#pk': 'PK', '#sk': 'SK' },
        ExpressionAttributeValues: {
          ':prefix': 'FILE#',
          ':sk': SK.META,
          ':false': false,
        },
      }),
    );
    return (result.Items || [])
      .map((item) =>
        fromItem(item as Record<string, unknown>, { includeDeleted: false }),
      )
      .filter((file): file is MediaFile => file != null);
  }
}

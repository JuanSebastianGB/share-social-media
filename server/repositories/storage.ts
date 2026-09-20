import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { getDocClient } from '../db/client.js';
import { generateId } from '../db/ids.js';
import { filePk, SK, TABLE_NAME } from '../db/keys.js';
import type {
  DeleteResult,
  StorageRecord,
} from '../types/entities.js';

function toStorage(
  item: Record<string, unknown> | undefined,
): StorageRecord | null {
  if (!item) return null;
  if (item.deleted === true) return null;
  return {
    _id: String(item._id),
    fileName: (item.fileName as string | undefined) ?? (item.filename as string | undefined),
    filename: (item.filename as string | undefined) ?? (item.fileName as string | undefined),
    url: item.url as string | undefined,
    deleted: item.deleted as boolean | undefined,
    createdAt: item.createdAt as string | undefined,
    updatedAt: item.updatedAt as string | undefined,
  };
}

/** Include soft-deleted rows (for hard-delete path). */
function toStorageRaw(
  item: Record<string, unknown> | undefined,
): StorageRecord | null {
  if (!item) return null;
  return {
    _id: String(item._id),
    fileName: (item.fileName as string | undefined) ?? (item.filename as string | undefined),
    filename: (item.filename as string | undefined) ?? (item.fileName as string | undefined),
    url: item.url as string | undefined,
    deleted: item.deleted as boolean | undefined,
    createdAt: item.createdAt as string | undefined,
    updatedAt: item.updatedAt as string | undefined,
  };
}

export async function createStorage(data: {
  _id?: string;
  fileName?: string;
  filename?: string;
  url?: string;
}): Promise<StorageRecord> {
  const doc = getDocClient();
  const id = data._id ? String(data._id) : generateId();
  const now = new Date().toISOString();
  const fileName = data.fileName ?? data.filename;

  const item = {
    PK: filePk(id),
    SK: SK.META,
    entityType: 'FILE',
    _id: id,
    fileName,
    url: data.url,
    deleted: false,
    createdAt: now,
    updatedAt: now,
  };

  await doc.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    }),
  );

  return toStorage(item)!;
}

export async function getStorageById(
  id: string,
): Promise<StorageRecord | null> {
  const doc = getDocClient();
  const result = await doc.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: filePk(id), SK: SK.META },
    }),
  );
  return toStorage(result.Item as Record<string, unknown> | undefined);
}

export async function getStorageByIdIncludingDeleted(
  id: string,
): Promise<StorageRecord | null> {
  const doc = getDocClient();
  const result = await doc.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: filePk(id), SK: SK.META },
    }),
  );
  return toStorageRaw(result.Item as Record<string, unknown> | undefined);
}

export async function listStorage(): Promise<StorageRecord[]> {
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
    .map((item) => toStorage(item as Record<string, unknown>))
    .filter((s): s is StorageRecord => s != null);
}

export async function softDeleteStorage(id: string): Promise<DeleteResult> {
  const existing = await getStorageByIdIncludingDeleted(id);
  if (!existing || existing.deleted) {
    return { acknowledged: true, deletedCount: 0 };
  }

  const doc = getDocClient();
  await doc.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: filePk(id), SK: SK.META },
      UpdateExpression: 'SET deleted = :true, updatedAt = :now',
      ExpressionAttributeValues: {
        ':true': true,
        ':now': new Date().toISOString(),
      },
    }),
  );
  return { acknowledged: true, deletedCount: 1 };
}

export async function hardDeleteStorage(id: string): Promise<DeleteResult> {
  const existing = await getStorageByIdIncludingDeleted(id);
  if (!existing) {
    return { acknowledged: true, deletedCount: 0 };
  }

  const doc = getDocClient();
  await doc.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: filePk(id), SK: SK.META },
    }),
  );
  return { acknowledged: true, deletedCount: 1 };
}

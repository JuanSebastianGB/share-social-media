import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { getDocClient } from '../db/client.js';
import { generateId } from '../db/ids.js';
import { itemPk, SK, TABLE_NAME } from '../db/keys.js';
import type {
  DeleteResult,
  ItemRecord,
  UpdateResult,
} from '../types/entities.js';

function toItem(item: Record<string, unknown> | undefined): ItemRecord | null {
  if (!item) return null;
  return {
    _id: String(item._id),
    name: String(item.name ?? ''),
    active: (item.active as boolean | undefined) ?? true,
    createdAt: item.createdAt as string | undefined,
    updatedAt: item.updatedAt as string | undefined,
  };
}

export async function createItem(
  data: Record<string, unknown>,
): Promise<ItemRecord> {
  const doc = getDocClient();
  const id = data._id ? String(data._id) : generateId();
  const now = new Date().toISOString();

  const item = {
    PK: itemPk(id),
    SK: SK.META,
    entityType: 'ITEM',
    _id: id,
    name: data.name,
    active: data.active ?? true,
    createdAt: now,
    updatedAt: now,
  };

  await doc.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    }),
  );

  return toItem(item)!;
}

export async function getItemById(id: string): Promise<ItemRecord | null> {
  const doc = getDocClient();
  const result = await doc.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: itemPk(id), SK: SK.META },
    }),
  );
  return toItem(result.Item as Record<string, unknown> | undefined);
}

export async function listItems(): Promise<ItemRecord[]> {
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
    .map((item) => toItem(item as Record<string, unknown>))
    .filter((i): i is ItemRecord => i != null);
}

export async function updateItem(
  id: string,
  patch: Record<string, unknown>,
): Promise<UpdateResult> {
  const existing = await getItemById(id);
  if (!existing) {
    return { acknowledged: true, matchedCount: 0, modifiedCount: 0 };
  }

  const doc = getDocClient();
  const now = new Date().toISOString();
  const expressionParts: string[] = ['updatedAt = :now'];
  const values: Record<string, unknown> = { ':now': now };
  const names: Record<string, string> = {};

  for (const [key, value] of Object.entries(patch)) {
    if (key === '_id') continue;
    const nameKey = `#${key}`;
    const valueKey = `:${key}`;
    names[nameKey] = key;
    values[valueKey] = value;
    expressionParts.push(`${nameKey} = ${valueKey}`);
  }

  await doc.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: itemPk(id), SK: SK.META },
      UpdateExpression: `SET ${expressionParts.join(', ')}`,
      ExpressionAttributeNames: Object.keys(names).length ? names : undefined,
      ExpressionAttributeValues: values,
    }),
  );

  return { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
}

export async function deleteItem(id: string): Promise<DeleteResult> {
  const existing = await getItemById(id);
  if (!existing) {
    return { acknowledged: true, deletedCount: 0 };
  }
  const doc = getDocClient();
  await doc.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: itemPk(id), SK: SK.META },
    }),
  );
  return { acknowledged: true, deletedCount: 1 };
}

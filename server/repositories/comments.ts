import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { getDocClient } from '../db/client.js';
import { generateId } from '../db/ids.js';
import { commentPk, SK, TABLE_NAME } from '../db/keys.js';
import type {
  CommentRecord,
  DeleteResult,
  UpdateResult,
} from '../types/entities.js';

function toComment(
  item: Record<string, unknown> | undefined,
): CommentRecord | null {
  if (!item) return null;
  return {
    _id: String(item._id),
    description: String(item.description ?? ''),
    userId: String(item.userId ?? ''),
    firstName: String(item.firstName ?? ''),
    lastName: String(item.lastName ?? ''),
    createdAt: item.createdAt as string | undefined,
    updatedAt: item.updatedAt as string | undefined,
  };
}

export async function createComment(
  data: Record<string, unknown>,
): Promise<CommentRecord> {
  const doc = getDocClient();
  const id = data._id ? String(data._id) : generateId();
  const now = new Date().toISOString();

  const item = {
    PK: commentPk(id),
    SK: SK.META,
    entityType: 'COMMENT',
    _id: id,
    description: data.description,
    userId: String(data.userId),
    firstName: data.firstName,
    lastName: data.lastName,
    createdAt: now,
    updatedAt: now,
  };

  await doc.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    }),
  );

  return toComment(item)!;
}

export async function getCommentById(
  id: string,
): Promise<CommentRecord | null> {
  const doc = getDocClient();
  const result = await doc.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: commentPk(id), SK: SK.META },
    }),
  );
  return toComment(result.Item as Record<string, unknown> | undefined);
}

export async function listComments(): Promise<CommentRecord[]> {
  const doc = getDocClient();
  const result = await doc.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'begins_with(#pk, :prefix) AND #sk = :sk',
      ExpressionAttributeNames: { '#pk': 'PK', '#sk': 'SK' },
      ExpressionAttributeValues: {
        ':prefix': 'COMMENT#',
        ':sk': SK.META,
      },
    }),
  );
  return (result.Items || [])
    .map((item) => toComment(item as Record<string, unknown>))
    .filter((c): c is CommentRecord => c != null);
}

export async function updateComment(
  id: string,
  patch: Record<string, unknown>,
): Promise<UpdateResult> {
  const existing = await getCommentById(id);
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
      Key: { PK: commentPk(id), SK: SK.META },
      UpdateExpression: `SET ${expressionParts.join(', ')}`,
      ExpressionAttributeNames: Object.keys(names).length ? names : undefined,
      ExpressionAttributeValues: values,
    }),
  );

  return { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
}

export async function deleteComment(id: string): Promise<DeleteResult> {
  const existing = await getCommentById(id);
  if (!existing) {
    return { acknowledged: true, deletedCount: 0 };
  }
  const doc = getDocClient();
  await doc.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: commentPk(id), SK: SK.META },
    }),
  );
  return { acknowledged: true, deletedCount: 1 };
}

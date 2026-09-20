import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { getDocClient } from '../db/client.js';
import { generateId } from '../db/ids.js';
import {
  GSI,
  postPk,
  postSortKey,
  SK,
  TABLE_NAME,
  userPk,
} from '../db/keys.js';
import type {
  DeleteResult,
  PostRecord,
} from '../types/entities.js';

function toPost(item: Record<string, unknown> | undefined): PostRecord | null {
  if (!item || item.entityType !== 'POST') return null;
  const likesRaw = item.likes;
  let likes: Record<string, boolean> = {};
  if (likesRaw && typeof likesRaw === 'object') {
    likes = { ...(likesRaw as Record<string, boolean>) };
  }

  return {
    _id: String(item._id),
    body: String(item.body ?? ''),
    userId: String(item.userId ?? ''),
    fileId: item.fileId ? String(item.fileId) : undefined,
    likes,
    comments: Array.isArray(item.comments)
      ? item.comments.map(String)
      : [],
    type: (item.type as string) ?? 'file',
    createdAt: item.createdAt as string | undefined,
    updatedAt: item.updatedAt as string | undefined,
  };
}

function buildPostItem(post: PostRecord): Record<string, unknown> {
  const createdAt = post.createdAt || new Date().toISOString();
  const iso = createdAt;
  return {
    PK: postPk(post._id),
    SK: SK.META,
    entityType: 'POST',
    _id: post._id,
    body: post.body,
    userId: post.userId,
    fileId: post.fileId,
    likes: post.likes ?? {},
    comments: post.comments ?? [],
    type: post.type ?? 'file',
    createdAt,
    updatedAt: post.updatedAt || createdAt,
    GSI1PK: GSI.FEED,
    GSI1SK: postSortKey(iso, post._id),
    GSI2PK: userPk(post.userId),
    GSI2SK: postSortKey(iso, post._id),
  };
}

export async function createPost(
  data: Record<string, unknown>,
): Promise<PostRecord> {
  const doc = getDocClient();
  const id = data._id ? String(data._id) : generateId();
  const now = new Date().toISOString();
  const post: PostRecord = {
    _id: id,
    body: String(data.body ?? ''),
    userId: String(data.userId),
    fileId: data.fileId ? String(data.fileId) : undefined,
    likes: (data.likes as Record<string, boolean>) ?? {},
    comments: (data.comments as string[]) ?? [],
    type: (data.type as string) ?? 'file',
    createdAt: now,
    updatedAt: now,
  };

  await doc.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: buildPostItem(post),
    }),
  );

  return post;
}

export async function getPostById(id: string): Promise<PostRecord | null> {
  const doc = getDocClient();
  const result = await doc.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: postPk(id), SK: SK.META },
    }),
  );
  return toPost(result.Item as Record<string, unknown> | undefined);
}

export async function savePost(post: PostRecord): Promise<PostRecord> {
  const doc = getDocClient();
  const updated = {
    ...post,
    updatedAt: new Date().toISOString(),
  };
  await doc.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: buildPostItem(updated),
    }),
  );
  return updated;
}

export async function deletePost(id: string): Promise<DeleteResult> {
  const existing = await getPostById(id);
  if (!existing) {
    return { acknowledged: true, deletedCount: 0 };
  }
  const doc = getDocClient();
  await doc.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: postPk(id), SK: SK.META },
    }),
  );
  return { acknowledged: true, deletedCount: 1 };
}

export async function listFeedPostIds(): Promise<string[]> {
  const doc = getDocClient();
  const result = await doc.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk',
      ExpressionAttributeValues: { ':pk': GSI.FEED },
      ScanIndexForward: false,
    }),
  );
  return (result.Items || [])
    .map((item) => String((item as { _id?: string })._id ?? ''))
    .filter(Boolean);
}

export async function listUserPostIds(userId: string): Promise<string[]> {
  const doc = getDocClient();
  const result = await doc.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI2',
      KeyConditionExpression: 'GSI2PK = :pk',
      ExpressionAttributeValues: { ':pk': userPk(userId) },
      ScanIndexForward: false,
    }),
  );
  return (result.Items || [])
    .map((item) => String((item as { _id?: string })._id ?? ''))
    .filter(Boolean);
}

export async function countPosts(): Promise<number> {
  const doc = getDocClient();
  const result = await doc.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'begins_with(#pk, :prefix) AND #sk = :sk',
      ExpressionAttributeNames: { '#pk': 'PK', '#sk': 'SK' },
      ExpressionAttributeValues: {
        ':prefix': 'POST#',
        ':sk': SK.META,
      },
    }),
  );
  return result.Items?.length ?? 0;
}

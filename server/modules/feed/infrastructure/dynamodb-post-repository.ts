import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { getDocClient } from '../../../db/client.js';
import {
  GSI,
  postPk,
  postSortKey,
  SK,
  TABLE_NAME,
  userPk,
} from '../../../db/keys.js';
import { Post } from '../domain/post.js';
import type { PostSnapshot } from '../domain/post.js';
import type { PostRepository } from '../application/ports/post-repository.js';

function toItem(snapshot: PostSnapshot): Record<string, unknown> {
  const createdAt = snapshot.createdAt;
  return {
    PK: postPk(snapshot.id),
    SK: SK.META,
    entityType: 'POST',
    _id: snapshot.id,
    body: snapshot.body,
    userId: snapshot.authorId,
    fileId: snapshot.fileId,
    likes: snapshot.likes,
    comments: snapshot.comments,
    type: snapshot.type,
    createdAt,
    updatedAt: snapshot.updatedAt,
    GSI1PK: GSI.FEED,
    GSI1SK: postSortKey(createdAt, snapshot.id),
    GSI2PK: userPk(snapshot.authorId),
    GSI2SK: postSortKey(createdAt, snapshot.id),
  };
}

function fromItem(
  item: Record<string, unknown> | undefined,
): Post | null {
  if (!item || item.entityType !== 'POST') return null;
  const likesRaw = item.likes;
  let likes: Record<string, boolean> = {};
  if (likesRaw && typeof likesRaw === 'object') {
    likes = { ...(likesRaw as Record<string, boolean>) };
  }
  return Post.reconstitute({
    id: String(item._id),
    body: String(item.body ?? ''),
    authorId: String(item.userId ?? ''),
    fileId: item.fileId ? String(item.fileId) : undefined,
    likes,
    comments: Array.isArray(item.comments)
      ? item.comments.map(String)
      : [],
    type: (item.type as string) ?? 'file',
    createdAt: String(item.createdAt ?? ''),
    updatedAt: String(item.updatedAt ?? item.createdAt ?? ''),
  });
}

/**
 * DynamoDB single-table adapter for the Post aggregate.
 */
export class DynamoPostRepository implements PostRepository {
  async save(post: Post): Promise<void> {
    const doc = getDocClient();
    await doc.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: toItem(post.toSnapshot()),
      }),
    );
  }

  async findById(id: string): Promise<Post | null> {
    const doc = getDocClient();
    const result = await doc.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: postPk(id), SK: SK.META },
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
        Key: { PK: postPk(id), SK: SK.META },
      }),
    );
    return true;
  }

  async listFeedIds(): Promise<string[]> {
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

  async listUserPostIds(authorId: string): Promise<string[]> {
    const doc = getDocClient();
    const result = await doc.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI2',
        KeyConditionExpression: 'GSI2PK = :pk',
        ExpressionAttributeValues: { ':pk': userPk(authorId) },
        ScanIndexForward: false,
      }),
    );
    return (result.Items || [])
      .map((item) => String((item as { _id?: string })._id ?? ''))
      .filter(Boolean);
  }

  async count(): Promise<number> {
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
}

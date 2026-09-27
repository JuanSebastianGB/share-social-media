import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  type QueryCommandInput,
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
import type {
  FeedIdPage,
  PostRepository,
} from '../application/ports/post-repository.js';

type FeedIndexKey = {
  PK: string;
  SK: string;
  GSI1PK: string;
  GSI1SK: string;
};

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
    const ids: string[] = [];
    let continuation: string | undefined;
    do {
      const page = await this.queryFeedIds({
        limit: FEED_DRAIN_LIMIT,
        continuation,
      });
      ids.push(...page.ids);
      continuation = page.continuation;
    } while (continuation);
    return ids;
  }

  async queryFeedIds(input: {
    limit: number;
    continuation?: string;
  }): Promise<FeedIdPage> {
    let exclusiveStartKey: FeedIndexKey | undefined;
    if (input.continuation !== undefined) {
      exclusiveStartKey = decodeContinuation(input.continuation);
      if (!exclusiveStartKey) return { ids: [] };
    }
    const result = await queryFeedIndex({
      limit: input.limit,
      exclusiveStartKey,
    });
    const ids = (result.Items || [])
      .map((item) => String((item as { _id?: string })._id ?? ''))
      .filter(Boolean);
    const indexKey = toFeedIndexKey(readLastEvaluatedKey(result));
    return {
      ids,
      ...(indexKey ? { continuation: encodeContinuation(indexKey) } : {}),
    };
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
    let total = 0;
    let exclusiveStartKey: FeedIndexKey | undefined;
    do {
      const result = await queryFeedIndex({
        countOnly: true,
        exclusiveStartKey,
      });
      total += result.Count ?? 0;
      exclusiveStartKey = toFeedIndexKey(readLastEvaluatedKey(result));
    } while (exclusiveStartKey);
    return total;
  }
}

const FEED_DRAIN_LIMIT = 100;

function feedQueryInput(input: {
  limit?: number;
  countOnly?: boolean;
  exclusiveStartKey?: FeedIndexKey;
}): QueryCommandInput {
  return {
    TableName: TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk',
    ExpressionAttributeValues: { ':pk': GSI.FEED },
    ScanIndexForward: false,
    ...(input.limit != null ? { Limit: input.limit } : {}),
    ...(input.countOnly ? { Select: 'COUNT' as const } : {}),
    ...(input.exclusiveStartKey
      ? { ExclusiveStartKey: exclusiveStartKey(input.exclusiveStartKey) }
      : {}),
  };
}

function exclusiveStartKey(
  cursor: FeedIndexKey,
): NonNullable<QueryCommandInput['ExclusiveStartKey']> {
  return {
    PK: cursor.PK,
    SK: cursor.SK,
    GSI1PK: cursor.GSI1PK,
    GSI1SK: cursor.GSI1SK,
  };
}

function readLastEvaluatedKey(result: object): unknown {
  return 'LastEvaluatedKey' in result ? result.LastEvaluatedKey : undefined;
}

function toFeedIndexKey(key: unknown): FeedIndexKey | undefined {
  if (!key || typeof key !== 'object') return undefined;
  const record = key as Record<string, unknown>;
  const PK = record.PK;
  const SK = record.SK;
  const GSI1PK = record.GSI1PK;
  const GSI1SK = record.GSI1SK;
  if (
    typeof PK !== 'string' ||
    typeof SK !== 'string' ||
    typeof GSI1PK !== 'string' ||
    typeof GSI1SK !== 'string'
  ) {
    return undefined;
  }
  return { PK, SK, GSI1PK, GSI1SK };
}

function encodeContinuation(key: FeedIndexKey): string {
  return JSON.stringify(key);
}

function decodeContinuation(continuation: string): FeedIndexKey | undefined {
  try {
    return toFeedIndexKey(JSON.parse(continuation));
  } catch {
    return undefined;
  }
}

function queryFeedIndex(input: {
  limit?: number;
  countOnly?: boolean;
  exclusiveStartKey?: FeedIndexKey;
}) {
  return getDocClient().send(new QueryCommand(feedQueryInput(input)));
}

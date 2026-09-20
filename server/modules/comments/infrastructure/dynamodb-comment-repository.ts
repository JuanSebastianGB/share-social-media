import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { getDocClient } from '../../../db/client.js';
import { commentPk, SK, TABLE_NAME } from '../../../db/keys.js';
import { Comment } from '../domain/comment.js';
import type { CommentSnapshot } from '../domain/comment.js';
import type { CommentRepository } from '../application/ports/comment-repository.js';

/**
 * Maps a Comment snapshot to the legacy DynamoDB COMMENT item shape
 * (formerly `server/repositories/comments.ts`).
 */
function toItem(snapshot: CommentSnapshot): Record<string, unknown> {
  return {
    PK: commentPk(snapshot.id),
    SK: SK.META,
    entityType: 'COMMENT',
    _id: snapshot.id,
    description: snapshot.description,
    userId: snapshot.authorId,
    firstName: snapshot.firstName,
    lastName: snapshot.lastName,
    createdAt: snapshot.createdAt,
    updatedAt: snapshot.updatedAt,
  };
}

function fromItem(
  item: Record<string, unknown> | undefined,
): Comment | null {
  if (!item || item.entityType !== 'COMMENT') return null;
  return Comment.reconstitute({
    id: String(item._id),
    description: String(item.description ?? ''),
    authorId: String(item.userId ?? ''),
    firstName: String(item.firstName ?? ''),
    lastName: String(item.lastName ?? ''),
    createdAt: String(item.createdAt ?? ''),
    updatedAt: String(item.updatedAt ?? item.createdAt ?? ''),
  });
}

/**
 * DynamoDB single-table adapter for the Comment aggregate.
 * Preserves the legacy COMMENT item shape formerly in `repositories/comments.ts`.
 */
export class DynamoCommentRepository implements CommentRepository {
  async save(comment: Comment): Promise<void> {
    const doc = getDocClient();
    await doc.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: toItem(comment.toSnapshot()),
      }),
    );
  }

  async findById(id: string): Promise<Comment | null> {
    const doc = getDocClient();
    const result = await doc.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: commentPk(id), SK: SK.META },
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
        Key: { PK: commentPk(id), SK: SK.META },
      }),
    );
    return true;
  }

  /**
   * All comments via Scan. Order is not guaranteed (legacy Scan behavior).
   */
  async list(): Promise<Comment[]> {
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
      .map((item) => fromItem(item as Record<string, unknown>))
      .filter((c): c is Comment => c != null);
  }
}

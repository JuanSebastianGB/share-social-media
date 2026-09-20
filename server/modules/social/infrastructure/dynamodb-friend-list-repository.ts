import {
  GetCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { getDocClient } from '../../../db/client.js';
import { SK, TABLE_NAME, userPk } from '../../../db/keys.js';
import { FriendList } from '../domain/friend-list.js';
import type { FriendListRepository } from '../application/ports/friend-list-repository.js';

function fromItem(
  item: Record<string, unknown> | undefined,
): FriendList | null {
  if (!item || item.entityType !== 'USER') return null;
  return FriendList.reconstitute({
    userId: String(item._id),
    friends: Array.isArray(item.friends) ? item.friends.map(String) : [],
    createdAt: String(item.createdAt ?? ''),
    updatedAt: String(item.updatedAt ?? item.createdAt ?? ''),
  });
}

/**
 * DynamoDB adapter for FriendList.
 * Reads/writes only `friends` (+ `updatedAt`) on the existing USER PROFILE item.
 * Does not create USER rows or Cognito links — Identity owns profile lifecycle.
 */
export class DynamoFriendListRepository implements FriendListRepository {
  async findByUserId(userId: string): Promise<FriendList | null> {
    const doc = getDocClient();
    const result = await doc.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: userPk(userId), SK: SK.PROFILE },
      }),
    );
    return fromItem(result.Item as Record<string, unknown> | undefined);
  }

  /**
   * Updates `friends` and `updatedAt` only — other USER profile attributes stay intact.
   * Throws when the USER row is missing (Social must not create empty profiles).
   */
  async save(friendList: FriendList): Promise<void> {
    const snapshot = friendList.toSnapshot();
    const doc = getDocClient();

    try {
      await doc.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { PK: userPk(snapshot.userId), SK: SK.PROFILE },
          UpdateExpression: 'SET friends = :friends, updatedAt = :updatedAt',
          ConditionExpression: 'attribute_exists(PK)',
          ExpressionAttributeValues: {
            ':friends': [...snapshot.friends],
            ':updatedAt': snapshot.updatedAt,
          },
        }),
      );
    } catch (error: unknown) {
      if (isConditionalCheckFailed(error)) {
        throw new Error(
          `Cannot save FriendList: USER profile does not exist for userId ${snapshot.userId}`,
        );
      }
      throw error;
    }
  }
}

function isConditionalCheckFailed(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name: string }).name === 'ConditionalCheckFailedException'
  );
}

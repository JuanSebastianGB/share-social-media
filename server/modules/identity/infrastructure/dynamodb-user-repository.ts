import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { getDocClient } from '../../../db/client.js';
import {
  cognitoPk,
  emailGsi1Pk,
  SK,
  TABLE_NAME,
  userPk,
} from '../../../db/keys.js';
import { User } from '../domain/user.js';
import type { UserSnapshot } from '../domain/user.js';
import type { UserRepository } from '../application/ports/user-repository.js';

/**
 * Maps a User snapshot to the legacy DynamoDB USER item shape
 * (formerly `server/repositories/users.ts`). Domain `id` ↔ item `_id`.
 */
function toItem(snapshot: UserSnapshot): Record<string, unknown> {
  return {
    PK: userPk(snapshot.id),
    SK: SK.PROFILE,
    entityType: 'USER',
    _id: snapshot.id,
    firstName: snapshot.firstName,
    lastName: snapshot.lastName,
    username: snapshot.username,
    password: snapshot.password,
    email: snapshot.email,
    age: snapshot.age,
    role: snapshot.role ?? 'user',
    friends: snapshot.friends ?? [],
    location: snapshot.location,
    occupation: snapshot.occupation,
    viewedProfile: snapshot.viewedProfile,
    impressions: snapshot.impressions,
    profileImageId: snapshot.profileImageId,
    cognitoSub: snapshot.cognitoSub,
    GSI1PK: emailGsi1Pk(snapshot.email),
    GSI1SK: SK.USER,
    createdAt: snapshot.createdAt,
    updatedAt: snapshot.updatedAt,
  };
}

function fromItem(
  item: Record<string, unknown> | undefined,
): User | null {
  if (!item || item.entityType !== 'USER') return null;
  return User.reconstitute({
    id: String(item._id),
    email: String(item.email ?? ''),
    firstName: item.firstName as string | undefined,
    lastName: item.lastName as string | undefined,
    username: item.username as string | undefined,
    password: item.password as string | undefined,
    age: item.age as number | undefined,
    role: (item.role as string | string[]) ?? 'user',
    friends: Array.isArray(item.friends) ? item.friends.map(String) : [],
    location: item.location as string | undefined,
    occupation: item.occupation as string | undefined,
    viewedProfile: item.viewedProfile as number | undefined,
    impressions: item.impressions as number | undefined,
    profileImageId: item.profileImageId
      ? String(item.profileImageId)
      : undefined,
    cognitoSub: item.cognitoSub ? String(item.cognitoSub) : undefined,
    createdAt: String(item.createdAt ?? ''),
    updatedAt: String(item.updatedAt ?? item.createdAt ?? ''),
  });
}

/**
 * DynamoDB single-table adapter for the User aggregate.
 * Preserves the legacy USER + COGNITO_LINK item shapes formerly in `repositories/users.ts`.
 */
export class DynamoUserRepository implements UserRepository {
  /**
   * Unconditional Put of the USER item (mirrors Comments / legacy `saveUser`).
   * When `cognitoSub` is present, also Puts the COGNITO_LINK item without
   * ConditionExpression so re-save is idempotent (unlike `createUser`, which
   * uses attribute_not_exists and would fail on second save).
   */
  async save(user: User): Promise<void> {
    const snapshot = user.toSnapshot();
    const doc = getDocClient();
    await doc.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: toItem(snapshot),
      }),
    );

    if (snapshot.cognitoSub) {
      await doc.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: cognitoPk(snapshot.cognitoSub),
            SK: SK.LINK,
            entityType: 'COGNITO_LINK',
            userId: snapshot.id,
            cognitoSub: snapshot.cognitoSub,
            createdAt: snapshot.createdAt,
          },
        }),
      );
    }
  }

  async findById(id: string): Promise<User | null> {
    const doc = getDocClient();
    const result = await doc.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: userPk(id), SK: SK.PROFILE },
      }),
    );
    return fromItem(result.Item as Record<string, unknown> | undefined);
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = getDocClient();
    const result = await doc.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :pk AND GSI1SK = :sk',
        ExpressionAttributeValues: {
          ':pk': emailGsi1Pk(email),
          ':sk': SK.USER,
        },
        Limit: 1,
      }),
    );
    const item = result.Items?.[0] as Record<string, unknown> | undefined;
    return fromItem(item);
  }

  async findByCognitoSub(cognitoSub: string): Promise<User | null> {
    const doc = getDocClient();
    const link = await doc.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: cognitoPk(cognitoSub), SK: SK.LINK },
      }),
    );
    const userId = link.Item?.userId;
    if (!userId) return null;
    return this.findById(String(userId));
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.findById(id);
    if (!existing) return false;

    const snapshot = existing.toSnapshot();
    const doc = getDocClient();
    await doc.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { PK: userPk(id), SK: SK.PROFILE },
      }),
    );
    if (snapshot.cognitoSub) {
      await doc.send(
        new DeleteCommand({
          TableName: TABLE_NAME,
          Key: { PK: cognitoPk(snapshot.cognitoSub), SK: SK.LINK },
        }),
      );
    }
    return true;
  }

  /**
   * All users via Scan. Order is not guaranteed (legacy Scan behavior).
   */
  async list(): Promise<User[]> {
    const doc = getDocClient();
    const result = await doc.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'begins_with(#pk, :prefix) AND #sk = :sk',
        ExpressionAttributeNames: { '#pk': 'PK', '#sk': 'SK' },
        ExpressionAttributeValues: {
          ':prefix': 'USER#',
          ':sk': SK.PROFILE,
        },
      }),
    );
    return (result.Items || [])
      .map((item) => fromItem(item as Record<string, unknown>))
      .filter((u): u is User => u != null);
  }
}

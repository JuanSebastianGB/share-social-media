/** Strangler remnant — runtime paths use `modules/identity`. Kept for reference. */
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
  cognitoPk,
  emailGsi1Pk,
  SK,
  TABLE_NAME,
  userPk,
} from '../db/keys.js';
import type { DeleteResult, UpdateResult, UserRecord } from '../types/entities.js';

type UserItem = Record<string, unknown> & {
  PK: string;
  SK: string;
  entityType: 'USER';
  _id: string;
};

function toUser(item: Record<string, unknown> | undefined): UserRecord | null {
  if (!item) return null;
  return {
    _id: String(item._id),
    firstName: item.firstName as string | undefined,
    lastName: item.lastName as string | undefined,
    username: item.username as string | undefined,
    password: item.password as string | undefined,
    email: String(item.email ?? ''),
    age: item.age as number | undefined,
    role: (item.role as string | string[]) ?? 'user',
    friends: (item.friends as string[]) ?? [],
    location: item.location as string | undefined,
    occupation: item.occupation as string | undefined,
    viewedProfile: item.viewedProfile as number | undefined,
    impressions: item.impressions as number | undefined,
    profileImageId: item.profileImageId
      ? String(item.profileImageId)
      : undefined,
    cognitoSub: item.cognitoSub ? String(item.cognitoSub) : undefined,
    createdAt: item.createdAt as string | undefined,
    updatedAt: item.updatedAt as string | undefined,
  };
}

export async function createUser(
  data: Record<string, unknown>,
): Promise<UserRecord> {
  const doc = getDocClient();
  const id = data._id ? String(data._id) : generateId();
  const now = new Date().toISOString();
  const email = String(data.email ?? '');
  const cognitoSub = data.cognitoSub ? String(data.cognitoSub) : undefined;

  const item: UserItem = {
    PK: userPk(id),
    SK: SK.PROFILE,
    entityType: 'USER',
    _id: id,
    firstName: data.firstName,
    lastName: data.lastName,
    username: data.username,
    password: data.password,
    email,
    age: data.age,
    role: data.role ?? 'user',
    friends: (data.friends as string[]) ?? [],
    location: data.location,
    occupation: data.occupation,
    viewedProfile: data.viewedProfile,
    impressions: data.impressions,
    profileImageId: data.profileImageId ? String(data.profileImageId) : undefined,
    cognitoSub,
    GSI1PK: emailGsi1Pk(email),
    GSI1SK: SK.USER,
    createdAt: now,
    updatedAt: now,
  };

  await doc.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
      ConditionExpression: 'attribute_not_exists(PK)',
    }),
  );

  if (cognitoSub) {
    await doc.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: cognitoPk(cognitoSub),
          SK: SK.LINK,
          entityType: 'COGNITO_LINK',
          userId: id,
          cognitoSub,
          createdAt: now,
        },
        ConditionExpression: 'attribute_not_exists(PK)',
      }),
    );
  }

  return toUser(item)!;
}

export async function getUserById(id: string): Promise<UserRecord | null> {
  const doc = getDocClient();
  const result = await doc.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: userPk(id), SK: SK.PROFILE },
    }),
  );
  return toUser(result.Item as Record<string, unknown> | undefined);
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
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
  return toUser(item);
}

export async function getUserByCognitoSub(
  cognitoSub: string,
): Promise<UserRecord | null> {
  const doc = getDocClient();
  const link = await doc.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: cognitoPk(cognitoSub), SK: SK.LINK },
    }),
  );
  const userId = link.Item?.userId;
  if (!userId) return null;
  return getUserById(String(userId));
}

export async function listUsers(): Promise<UserRecord[]> {
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
    .map((item) => toUser(item as Record<string, unknown>))
    .filter((u): u is UserRecord => u != null);
}

export async function saveUser(user: UserRecord): Promise<UserRecord> {
  const doc = getDocClient();
  const now = new Date().toISOString();
  const item = {
    PK: userPk(user._id),
    SK: SK.PROFILE,
    entityType: 'USER',
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    password: user.password,
    email: user.email,
    age: user.age,
    role: user.role ?? 'user',
    friends: user.friends ?? [],
    location: user.location,
    occupation: user.occupation,
    viewedProfile: user.viewedProfile,
    impressions: user.impressions,
    profileImageId: user.profileImageId,
    cognitoSub: user.cognitoSub,
    GSI1PK: emailGsi1Pk(user.email),
    GSI1SK: SK.USER,
    createdAt: user.createdAt,
    updatedAt: now,
  };

  await doc.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    }),
  );

  return toUser(item)!;
}

export async function updateUser(
  id: string,
  patch: Record<string, unknown>,
): Promise<UpdateResult> {
  const existing = await getUserById(id);
  if (!existing) {
    return { acknowledged: true, matchedCount: 0, modifiedCount: 0 };
  }
  await saveUser({ ...existing, ...patch, _id: id } as UserRecord);
  return { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
}

export async function deleteUser(id: string): Promise<DeleteResult> {
  const doc = getDocClient();
  const existing = await getUserById(id);
  if (!existing) {
    return { acknowledged: true, deletedCount: 0 };
  }
  await doc.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: userPk(id), SK: SK.PROFILE },
    }),
  );
  if (existing.cognitoSub) {
    await doc.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { PK: cognitoPk(existing.cognitoSub), SK: SK.LINK },
      }),
    );
  }
  return { acknowledged: true, deletedCount: 1 };
}
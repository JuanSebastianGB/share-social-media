import { getFileService } from '../../../services/storage.js';
import { generateToken } from '../../../utilities/handleJwt.js';
import type { UserSnapshot } from '../domain/user.js';
import { DynamoUserRepository } from '../infrastructure/dynamodb-user-repository.js';
import { completeProfile as completeProfileUseCase } from './use-cases/complete-profile.js';
import { findUserByCognitoSub as findUserByCognitoSubUseCase } from './use-cases/find-user-by-cognito-sub.js';
import { findUserByEmail as findUserByEmailUseCase } from './use-cases/find-user-by-email.js';
import { findUserById as findUserByIdUseCase } from './use-cases/find-user-by-id.js';
import { listUsers as listUsersUseCase } from './use-cases/list-users.js';
import { registerUser as registerUserUseCase } from './use-cases/register-user.js';
import { toggleFriendship as toggleFriendshipUseCase } from './use-cases/toggle-friendship.js';

const userRepository = new DynamoUserRepository();

/** Legacy HTTP shape for User documents (`UserRecord`). */
export function toLegacyUserRecord(snapshot: UserSnapshot) {
  return {
    _id: snapshot.id,
    firstName: snapshot.firstName,
    lastName: snapshot.lastName,
    username: snapshot.username,
    password: snapshot.password,
    email: snapshot.email,
    age: snapshot.age,
    role: snapshot.role,
    friends: snapshot.friends,
    location: snapshot.location,
    occupation: snapshot.occupation,
    viewedProfile: snapshot.viewedProfile,
    impressions: snapshot.impressions,
    profileImageId: snapshot.profileImageId,
    cognitoSub: snapshot.cognitoSub,
    createdAt: snapshot.createdAt,
    updatedAt: snapshot.updatedAt,
  };
}

function registerCommandFromData(data: Record<string, unknown>) {
  return {
    id: data._id ? String(data._id) : undefined,
    email: String(data.email ?? ''),
    firstName: data.firstName != null ? String(data.firstName) : undefined,
    lastName: data.lastName != null ? String(data.lastName) : undefined,
    username: data.username != null ? String(data.username) : undefined,
    location: data.location != null ? String(data.location) : undefined,
    occupation: data.occupation != null ? String(data.occupation) : undefined,
    role: data.role as string | string[] | undefined,
    friends: Array.isArray(data.friends)
      ? data.friends.map(String)
      : undefined,
    password: data.password != null ? String(data.password) : undefined,
    cognitoSub: data.cognitoSub != null ? String(data.cognitoSub) : undefined,
    age: typeof data.age === 'number' ? data.age : undefined,
    viewedProfile:
      typeof data.viewedProfile === 'number' ? data.viewedProfile : undefined,
    impressions:
      typeof data.impressions === 'number' ? data.impressions : undefined,
    profileImageId: data.profileImageId
      ? String(data.profileImageId)
      : undefined,
  };
}

/**
 * Creates a new user and returns the user object (without password) and a token.
 * HS256 / local mode only.
 */
export async function registerService(dataToStore: Record<string, unknown>) {
  const user = await registerUserUseCase(
    userRepository,
    registerCommandFromData(dataToStore),
  );
  const response = toLegacyUserRecord(user.toSnapshot());
  const { password: _pw, ...safe } = response;
  const { _id, role } = safe;
  return {
    response: safe,
    token: generateToken({
      _id: String(_id),
      role: role as string | string[],
    }),
  };
}

/**
 * Cognito mode: create DynamoDB profile linked to cognitoSub (no password / no app JWT).
 * Idempotent when the sub already has a profile.
 */
export async function completeProfileService(
  cognitoSub: string,
  dataToStore: Record<string, unknown>,
) {
  const { password: _ignored, ...withoutPassword } =
    registerCommandFromData(dataToStore);
  const result = await completeProfileUseCase(
    userRepository,
    cognitoSub,
    withoutPassword,
  );
  const response = toLegacyUserRecord(result.user.toSnapshot());
  const { password: _pw, ...safe } = response;
  return { response: safe, created: result.created };
}

export async function getUserByCognitoSubService(cognitoSub: string) {
  const user = await findUserByCognitoSubUseCase(userRepository, cognitoSub);
  if (!user) return null;
  return toLegacyUserRecord(user.toSnapshot());
}

export async function getUsersService(): Promise<any[]> {
  const users = await listUsersUseCase(userRepository);
  const result = [];
  for (const user of users) {
    const snapshot = user.toSnapshot();
    const profileImage = snapshot.profileImageId
      ? await getFileService(String(snapshot.profileImageId))
      : null;
    if (!profileImage) continue;
    result.push({
      _id: snapshot.id,
      firstName: snapshot.firstName,
      lastName: snapshot.lastName,
      profileImage,
      role: snapshot.role,
      friends: snapshot.friends,
      location: snapshot.location,
      occupation: snapshot.occupation,
      viewedProfile: snapshot.viewedProfile,
      impressions: snapshot.impressions,
    });
  }
  return result;
}

export async function getUserService(id: string) {
  const user = await findUserByIdUseCase(userRepository, id);
  if (!user) return null;
  const snapshot = user.toSnapshot();
  const fileInfo = snapshot.profileImageId
    ? await getFileService(String(snapshot.profileImageId))
    : null;
  return {
    _id: snapshot.id,
    firstName: snapshot.firstName,
    lastName: snapshot.lastName,
    age: snapshot.age,
    email: snapshot.email,
    role: snapshot.role,
    friends: snapshot.friends,
    location: snapshot.location,
    occupation: snapshot.occupation,
    viewedProfile: snapshot.viewedProfile,
    impressions: snapshot.impressions,
    profileImageId: snapshot.profileImageId,
    picturePath: fileInfo?.url,
  };
}

export async function getUserFromEmailService(email: string) {
  const user = await findUserByEmailUseCase(userRepository, email);
  if (!user) return null;
  const legacy = toLegacyUserRecord(user.toSnapshot());
  const fileInfo = legacy.profileImageId
    ? await getFileService(String(legacy.profileImageId))
    : null;
  return {
    ...legacy,
    picturePath: fileInfo?.url,
  };
}

export async function getUserFriendsService(id: string) {
  const user = await findUserByIdUseCase(userRepository, id);
  if (!user) return [];
  return await Promise.all(
    user.toSnapshot().friends.map(async (friendId: string) =>
      getUserService(friendId),
    ),
  );
}

export async function toggleRelationFriendService(
  id: string,
  friendId: string,
) {
  await toggleFriendshipUseCase(userRepository, id, friendId);
  return await getUserFriendsService(id);
}

/**
 * Feed assembler lookup — UserView fields only (no password / email).
 */
export async function getUserByIdForAssembler(userId: string) {
  const user = await findUserByIdUseCase(userRepository, userId);
  if (!user) return null;
  const snapshot = user.toSnapshot();
  return {
    _id: snapshot.id,
    firstName: snapshot.firstName,
    lastName: snapshot.lastName,
    friends: snapshot.friends,
    location: snapshot.location,
    occupation: snapshot.occupation,
    viewedProfile: snapshot.viewedProfile,
    impressions: snapshot.impressions,
    profileImageId: snapshot.profileImageId,
  };
}

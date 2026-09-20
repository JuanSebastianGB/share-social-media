import {
  getUserByEmail,
  getUserById,
  listUsers,
  saveUser,
} from '../repositories/users.js';
import { getFileService } from './storage.js';

const getUsersService = async (): Promise<any[]> => {
  const users = await listUsers();
  const result = [];
  for (const user of users) {
    const profileImage = user.profileImageId
      ? await getFileService(String(user.profileImageId))
      : null;
    if (!profileImage) continue;
    result.push({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage,
      role: user.role,
      friends: user.friends,
      location: user.location,
      occupation: user.occupation,
      viewedProfile: user.viewedProfile,
      impressions: user.impressions,
    });
  }
  return result;
};

const getUserService = async (id: string) => {
  const user = await getUserById(id);
  if (!user) return null;
  const fileInfo = user.profileImageId
    ? await getFileService(String(user.profileImageId))
    : null;
  return {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    age: user.age,
    email: user.email,
    role: user.role,
    friends: user.friends,
    location: user.location,
    occupation: user.occupation,
    viewedProfile: user.viewedProfile,
    impressions: user.impressions,
    profileImageId: user.profileImageId,
    picturePath: fileInfo?.url,
  };
};

const getUserFromEmailService = async (email: string) => {
  const user = await getUserByEmail(email);
  if (!user) return null;
  const fileInfo = user.profileImageId
    ? await getFileService(String(user.profileImageId))
    : null;
  return {
    ...user,
    picturePath: fileInfo?.url,
  };
};

const getUserFriendsService = async (id: string) => {
  const user = await getUserById(id);
  if (!user) return [];
  return await Promise.all(
    user.friends.map(async (friendId: string) => await getUserService(friendId)),
  );
};

const toggleRelationFriendService = async (id: string, friendId: string) => {
  const user = await getUserById(id);
  const friend = await getUserById(friendId);
  if (!user || !friend) throw new Error('USER_OR_FRIEND_NOT_FOUND');

  if (user.friends.includes(friendId)) {
    user.friends = user.friends.filter((_id: string) => _id !== friendId);
    friend.friends = friend.friends.filter((_id: string) => _id !== id);
  } else {
    user.friends.push(friendId);
    friend.friends.push(id);
  }
  await saveUser(user);
  await saveUser(friend);

  return await getUserFriendsService(id);
};

export {
  getUsersService,
  getUserService,
  getUserFriendsService,
  toggleRelationFriendService,
  getUserFromEmailService,
};

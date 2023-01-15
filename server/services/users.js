import User from '../models/user.js';
import { getFileService } from './storage.js';

/**
 * It gets all users and their profile images.
 * @returns An array of objects.
 */
const getUsersService = async () => {
  const result = await User.aggregate([
    {
      $lookup: {
        from: 'storages',
        localField: 'profileImageId',
        foreignField: '_id',
        as: 'profileImage',
      },
    },
    { $unwind: '$profileImage' },
    {
      $project: {
        firstName: 1,
        lastName: 1,
        profileImage: 1,
        role: 1,
        friends: 1,
        location: 1,
        occupation: 1,
        viewedProfile: 1,
        impressions: 1,
      },
    },
  ]);
  return result;
};

/**
 * Get a user by id, then get the file info for the user's profile image, then return the user with the
 * file info url.
 * @param id - the id of the user
 * @returns The user object with the picturePath property added.
 */
const getUserService = async (id) => {
  const user = await User.findById(id).select(
    'firstName lastName age email role friends location occupation picturePath viewedProfile impressions profileImageId'
  );
  const fileInfo = await getFileService(user.profileImageId);
  return { ...user._doc, picturePath: fileInfo.url };
};

/**
 * Get a user from the database by email, then get the file from the database by the user's
 * profileImageId, then return the user with the file's url.
 * @param email - String
 * @returns The user object with the picturePath property added.
 */
const getUserFromEmailService = async (email) => {
  const user = await User.findOne({ email }).select(
    'email role profileImageId password firstName lastName friends location occupation picturePath viewedProfile impressions'
  );
  if (!user) return null;
  const fileInfo = await getFileService(user.profileImageId);
  return { ...user._doc, picturePath: fileInfo.url };
};

/**
 * Get the user's friends by id, then return the user's friends' firstName, lastName, location,
 * occupation, and picturePath.
 * @param id - the id of the user whose friends you want to get
 * @returns An array of promises.
 */
const getUserFriendsService = async (id) => {
  const user = await User.findById(id);
  return await Promise.all(
    user.friends.map(
      async (id) =>
        // User.findById(id).select(
        //   'firstName lastName  location occupation picturePath'
        // )
        await getUserService(id)
    )
  );
};

/**
 * If the user is already friends with the friend, remove them from each other's friends list,
 * otherwise add them to each other's friends list.
 * @param id - the id of the user who is making the request
 * @param friendId - the id of the friend you want to add/remove
 * @returns The return value is the result of the getUserFriendsService function.
 */
const toggleRelationFriendService = async (id, friendId) => {
  const user = await User.findById(id);
  const friend = await User.findById(friendId);

  console.log({ user, friend });
  if (user.friends.includes(friendId)) {
    user.friends = user.friends.filter((_id) => _id !== friendId);
    friend.friends = friend.friends.filter((_id) => _id !== id);
  } else {
    user.friends.push(friendId);
    friend.friends.push(id);
  }
  await user.save();
  await friend.save();

  return await getUserFriendsService(id);
};

export {
  getUsersService,
  getUserService,
  getUserFriendsService,
  toggleRelationFriendService,
  getUserFromEmailService,
};

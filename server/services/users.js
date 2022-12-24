import User from '../models/user.js';

/**
 * This function gets all users from the database and returns them.
 * @returns An array of objects.
 */
const getUsersService = async () =>
  await User.find({}).select(
    'firstName lastName age email role friends location occupation picturePath viewedProfile impressions'
  );

/**
 * This function returns a user object from the database, but only returns the firstName, lastName,
 * age, email, role, friends, location, occupation, picturePath, viewedProfile, and impressions
 * properties of the user object.
 * @param id - the id of the user
 * @returns The user object with the specified id.
 */
const getUserService = async (id) =>
  await User.findById(id).select(
    'firstName lastName age email role friends location occupation picturePath viewedProfile impressions'
  );

/**
 * Get the user's friends by id, then return the user's friends' firstName, lastName, location,
 * occupation, and picturePath.
 * @param id - the id of the user whose friends you want to get
 * @returns An array of promises.
 */
const getUserFriendsService = async (id) => {
  const user = await User.findById(id);
  return await Promise.all(
    user.friends.map(async (id) =>
      User.findById(id).select(
        'firstName lastName  location occupation picturePath'
      )
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
};

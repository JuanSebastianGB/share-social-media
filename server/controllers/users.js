import { matchedData } from 'express-validator';
import User from '../models/user.js';
import { handleHttpErrors } from '../utilities/handleHttpErrors.js';

const getUsers = async (req, res) => {
  try {
    const items = await User.find({}).select(
      'firstName lastName age email role friends location occupation picturePath viewedProfile impressions'
    );
    return res.json(items);
  } catch (error) {
    console.log(error);
    handleHttpErrors(res, 'ERROR_GET_USERS');
  }
};

const getUser = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const item = await User.findById(id).select(
      'firstName lastName age email role friends location occupation picturePath viewedProfile impressions'
    );
    return res.json(item);
  } catch (error) {
    handleHttpErrors(res, 'ERROR_GET_USER');
  }
};

const getUserFriends = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const user = await User.findById(id);

    const userFriends = await Promise.all(
      user.friends.map(async (id) =>
        User.findById(id).select(
          'firstName lastName  location occupation picturePath'
        )
      )
    );

    return res.json(userFriends);
  } catch (error) {
    handleHttpErrors(res, 'ERROR_GET_USERS');
  }
};

export { getUsers, getUser, getUserFriends };

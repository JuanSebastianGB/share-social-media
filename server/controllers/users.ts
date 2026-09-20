import type { RequestHandler } from 'express';
import { matchedData } from 'express-validator';
import {
  getUserFriendsService,
  getUserService,
  getUsersService,
  toggleRelationFriendService,
} from '../services/users.js';
import { handleHttpErrors } from '../utilities/handleHttpErrors.js';

const getUsers: RequestHandler = async (_req, res) => {
  try {
    const users = await getUsersService();
    return res.json(users);
  } catch {
    handleHttpErrors(res, 'ERROR_GET_USERS');
  }
};

const getUser: RequestHandler = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const user = await getUserService(id);
    return res.json(user);
  } catch {
    handleHttpErrors(res, 'ERROR_GET_USER');
  }
};

const getUserFriends: RequestHandler = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const friends = await getUserFriendsService(id);
    return res.json(friends);
  } catch {
    handleHttpErrors(res, 'ERROR_GET_USERS');
  }
};

const toggleRelationFriend: RequestHandler = async (req, res) => {
  const { id, friendId } = matchedData(req);

  try {
    const userFriends = await toggleRelationFriendService(id, friendId);
    return res.json(userFriends);
  } catch (error) {
    console.log(error);
    handleHttpErrors(res, 'ERROR_TOGGLE_FRIEND', 404);
  }
};

export { getUsers, getUser, getUserFriends, toggleRelationFriend };

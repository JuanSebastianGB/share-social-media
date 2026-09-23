import type { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import { HttpStatusError } from '../middlewares/error-mapper.js';
import {
  getUserFriendsService,
  getUserService,
  getUsersService,
  toggleRelationFriendService,
} from '../services/users.js';
import { asyncHandler } from '../utilities/asyncHandler.js';

export const getUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await getUsersService();
  return res.json(users);
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = matchedData(req);
  const user = await getUserService(id);
  return res.json(user);
});

export const getUserFriends = asyncHandler(async (req: Request, res: Response) => {
  const { id } = matchedData(req);
  const friends = await getUserFriendsService(id);
  return res.json(friends);
});

export const toggleRelationFriend = asyncHandler(
  async (req: Request, res: Response) => {
    const { friendId } = matchedData(req);
    const id = req.userData!._id;

    const userFriends = await toggleRelationFriendService(id, friendId);
    return res.json(userFriends);
  },
);

void HttpStatusError;
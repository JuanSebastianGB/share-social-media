import type { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import {
  createCommentOnPostService,
  deleteCommentService,
  getCommentService,
  listCommentsService,
  updateCommentService,
} from '../modules/comments/index.js';
import { asyncHandler } from '../utilities/asyncHandler.js';

export const getItems = asyncHandler(async (_req: Request, res: Response) => {
  const items = await listCommentsService();
  return res.json(items);
});

export const getItem = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const item = await getCommentService(id);
  return res.json(item);
});

export const createItem = asyncHandler(async (req: Request, res: Response) => {
  const { postId, ...body } = matchedData(req);
  const data = await createCommentOnPostService({
    postId: String(postId),
    body: {
      ...body,
      userId: req.userData!._id,
    },
  });
  return res.json(data);
});

export const updateItem = asyncHandler(async (req: Request, res: Response) => {
  const {
    body,
    params: { id },
  } = req;
  const response = await updateCommentService(id, body);
  return res.json(response);
});

export const deleteItem = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const response = await deleteCommentService(id);
  return res.json(response);
});
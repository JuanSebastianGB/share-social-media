import type { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import {
  createItemService,
  deleteItemService,
  getItemService,
  listItemsService,
  updateItemService,
} from '../services/items.js';
import { asyncHandler } from '../utilities/asyncHandler.js';

export const getItems = asyncHandler(async (_req: Request, res: Response) => {
  const items = await listItemsService();
  return res.json(items);
});

export const getItem = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const item = await getItemService(id);
  return res.json(item);
});

export const createItem = asyncHandler(async (req: Request, res: Response) => {
  const body = matchedData(req);
  const newItem = await createItemService(body);
  return res.json({ newItem });
});

export const updateItem = asyncHandler(async (req: Request, res: Response) => {
  const {
    body,
    params: { id },
  } = req;
  const response = await updateItemService(id, body);
  return res.json(response);
});

export const deleteItem = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const response = await deleteItemService(id);
  return res.json(response);
});
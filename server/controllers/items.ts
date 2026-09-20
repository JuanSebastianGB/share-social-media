import type { RequestHandler } from 'express';
import { matchedData } from 'express-validator';
import {
  createItemService,
  deleteItemService,
  getItemService,
  listItemsService,
  updateItemService,
} from '../services/items.js';
import { handleHttpErrors } from '../utilities/handleHttpErrors.js';

export const getItems: RequestHandler = async (_req, res) => {
  try {
    const items = await listItemsService();
    return res.json(items);
  } catch {
    handleHttpErrors(res, 'ERROR_CREATE_ITEM');
  }
};

export const getItem: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await getItemService(id);
    return res.json(item);
  } catch {
    handleHttpErrors(res, 'ERROR_GET_ITEM');
  }
};

export const createItem: RequestHandler = async (req, res) => {
  try {
    const body = matchedData(req);
    const newItem = await createItemService(body);
    return res.json({ newItem });
  } catch {
    handleHttpErrors(res, 'ERROR_CREATE_ITEM');
  }
};

export const updateItem: RequestHandler = async (req, res) => {
  try {
    const {
      body,
      params: { id },
    } = req;
    const response = await updateItemService(id, body);
    return res.json(response);
  } catch {
    handleHttpErrors(res, 'ERROR_UPDATE_ITEM');
  }
};

export const deleteItem: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await deleteItemService(id);
    return res.json(response);
  } catch {
    handleHttpErrors(res, 'ERROR_DELETE_ITEM');
  }
};

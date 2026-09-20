import type { RequestHandler } from 'express';
import { matchedData } from 'express-validator';
import {
  createCommentOnPostService,
  deleteCommentService,
  getCommentService,
  listCommentsService,
  updateCommentService,
} from '../modules/comments/index.js';
import { handleHttpErrors } from '../utilities/handleHttpErrors.js';

export const getItems: RequestHandler = async (_req, res) => {
  try {
    const items = await listCommentsService();
    return res.json(items);
  } catch {
    handleHttpErrors(res, 'ERROR_CREATE_COMMENT');
  }
};

export const getItem: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await getCommentService(id);
    return res.json(item);
  } catch {
    handleHttpErrors(res, 'ERROR_GET_COMMENT');
  }
};

export const createItem: RequestHandler = async (req, res) => {
  try {
    const { postId, ...body } = matchedData(req);
    const data = await createCommentOnPostService({
      postId: String(postId),
      body: {
        ...body,
        userId: req.userData!._id,
      },
    });
    return res.json(data);
  } catch {
    handleHttpErrors(res, 'ERROR_CREATE_COMMENT');
  }
};

export const updateItem: RequestHandler = async (req, res) => {
  try {
    const {
      body,
      params: { id },
    } = req;
    const response = await updateCommentService(id, body);
    return res.json(response);
  } catch {
    handleHttpErrors(res, 'ERROR_UPDATE_COMMENT');
  }
};

export const deleteItem: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await deleteCommentService(id);
    return res.json(response);
  } catch {
    handleHttpErrors(res, 'ERROR_DELETE_COMMENT');
  }
};

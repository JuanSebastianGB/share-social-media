import type { RequestHandler } from 'express';
import { matchedData } from 'express-validator';
import {
  attachCommentToPostService,
  getPostService,
} from '../modules/feed/index.js';
import {
  createComment,
  deleteComment,
  getCommentById,
  listComments,
  updateComment,
} from '../repositories/comments.js';
import { handleHttpErrors } from '../utilities/handleHttpErrors.js';

export const getItems: RequestHandler = async (_req, res) => {
  try {
    const items = await listComments();
    return res.json(items);
  } catch {
    handleHttpErrors(res, 'ERROR_CREATE_COMMENT');
  }
};

export const getItem: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await getCommentById(id);
    return res.json(item);
  } catch {
    handleHttpErrors(res, 'ERROR_GET_COMMENT');
  }
};

export const createItem: RequestHandler = async (req, res) => {
  try {
    const { postId, ...body } = matchedData(req);
    const newItem = await createComment({
      ...body,
      userId: req.userData!._id,
    });
    await attachCommentToPostService(String(postId), newItem._id);
    const data = await getPostService(postId);
    return res.json(data[0]);
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
    const response = await updateComment(id, body);
    return res.json(response);
  } catch {
    handleHttpErrors(res, 'ERROR_UPDATE_COMMENT');
  }
};

export const deleteItem: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await deleteComment(id);
    return res.json(response);
  } catch {
    handleHttpErrors(res, 'ERROR_DELETE_COMMENT');
  }
};

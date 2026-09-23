import type { RequestHandler } from 'express';
import { matchedData } from 'express-validator';
import { DEFAULT_IMAGE_ID } from '../constants/constants.js';
import { getCommentService } from '../modules/comments/index.js';
import {
  countPostsService,
  createPostService,
  deletePostService,
  findPostAggregate,
  getPostService,
  getPostsPaginationService,
  getPostsService,
  getUserPostsService,
  toggleLikePostService,
} from '../modules/feed/index.js';
import {
  createFileUploadedRegisterService,
  deleteHardFileService,
} from '../services/storage.js';
import { handleHttpErrors } from '../utilities/handleHttpErrors.js';

export const getPosts: RequestHandler = async (_req, res) => {
  try {
    const posts = await getPostsService();
    return res.json(posts);
  } catch {
    handleHttpErrors(res, 'ERROR_GET_POSTS');
  }
};

export const getPostsPagination: RequestHandler = async (req, res) => {
  const limit = 2;
  const total = await countPostsService();
  const _pages = Math.ceil(total / limit);
  void _pages;
  const page = !req.query.page ? 1 : Number(req.query.page);
  const search = (req.query.search as string) || '';
  const start = (page - 1) * limit;

  const posts = await getPostsPaginationService(start, limit, search);

  return res.json(posts);
};

export const getPost: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await getPostService(id);
    return res.json(post);
  } catch (error) {
    console.log(error);
    handleHttpErrors(res, 'ERROR_GET_POST');
  }
};

export const createUserPostFile: RequestHandler = async (req, res) => {
  if (!req.file) return handleHttpErrors(res, 'ERROR_MISSING_FILE');

  const filename =
    (req.file as Express.Multer.File & { filename?: string }).filename ||
    req.file.originalname;
  const savedFileRegister = await createFileUploadedRegisterService(
    filename,
    req.image?.secure_url,
  );
  try {
    const body = matchedData(req);
    const newPost = await createPostService({
      ...body,
      userId: req.userData!._id,
      fileId: savedFileRegister._id,
    });
    const newData = await getPostService(newPost._id);
    return res.json(newData[0]);
  } catch {
    await deleteHardFileService(savedFileRegister._id);
    handleHttpErrors(res, 'ERROR_CREATE_POST');
  }
};

export const createUserPost: RequestHandler = async (req, res) => {
  try {
    const body = matchedData(req);
    const newPost = await createPostService({
      ...body,
      userId: req.userData!._id,
      fileId: DEFAULT_IMAGE_ID,
    });
    const newData = await getPostService(newPost._id);
    return res.json(newData[0]);
  } catch {
    handleHttpErrors(res, 'ERROR_CREATE_POST');
  }
};

export const getUserPosts: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const posts = await getUserPostsService(id);
    return res.json(posts);
  } catch (error) {
    console.log({ error });
    handleHttpErrors(res, 'ERROR_GET_USER_POSTS');
  }
};

export const deletePost: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await deletePostService(id);
    return res.json(response);
  } catch (error) {
    console.log(error);
    handleHttpErrors(res, 'ERROR_DELETE_POST');
  }
};

export const toggleLikePost: RequestHandler = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const response = await toggleLikePostService(id, req.userData!._id);
    return res.json(response);
  } catch (error) {
    console.log(error);
    handleHttpErrors(res, 'ERROR_TOGGLE_LIKE_POST');
  }
};

export const getPostComments: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await findPostAggregate(id);
    const result = await Promise.all(
      (post?.toSnapshot().comments || []).map(
        async (commentId: string) => await getCommentService(commentId),
      ),
    );
    return res.json(result);
  } catch {
    handleHttpErrors(res, 'ERROR_GET_POST_COMMENTS');
  }
};

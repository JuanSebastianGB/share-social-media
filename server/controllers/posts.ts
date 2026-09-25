import type { Request, Response } from 'express';
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
import { asyncHandler } from '../utilities/asyncHandler.js';

export const getPosts = asyncHandler(async (_req: Request, res: Response) => {
  const posts = await getPostsService();
  res.json(posts);
});

export const getPostsPagination = asyncHandler(async (req: Request, res: Response) => {
  const limit = 2;
  const total = await countPostsService();
  const _pages = Math.ceil(total / limit);
  void _pages;
  const page = !req.query.page ? 1 : Number(req.query.page);
  const search = (req.query.search as string) || '';
  const start = (page - 1) * limit;

  const posts = await getPostsPaginationService(start, limit, search);

  res.json(posts);
});

export const getPost = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const post = await getPostService(id);
  res.json(post);
});

export const createUserPostFile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw new Error('ERROR_MISSING_FILE');

  const filename =
    (req.file as Express.Multer.File & { filename?: string }).filename ||
    req.file.originalname;
  const savedFileRegister = await createFileUploadedRegisterService(
    filename,
    req.image?.secure_url,
    req.userData!._id,
  );
  try {
    const body = matchedData(req);
    const newPost = await createPostService({
      ...body,
      userId: req.userData!._id,
      fileId: savedFileRegister._id,
    });
    const newData = await getPostService(newPost._id);
    res.json(newData[0]);
  } catch (err) {
    await deleteHardFileService(savedFileRegister._id);
    throw err;
  }
});

export const createUserPost = asyncHandler(async (req: Request, res: Response) => {
  const body = matchedData(req);
  const newPost = await createPostService({
    ...body,
    userId: req.userData!._id,
    fileId: DEFAULT_IMAGE_ID,
  });
  const newData = await getPostService(newPost._id);
  res.json(newData[0]);
});

export const getUserPosts = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const posts = await getUserPostsService(id);
  res.json(posts);
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const response = await deletePostService(id, req.userData!._id);
  res.json(response);
});

export const toggleLikePost = asyncHandler(async (req: Request, res: Response) => {
  const { id } = matchedData(req);
  const response = await toggleLikePostService(id, req.userData!._id);
  res.json(response);
});

export const getPostComments = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const post = await findPostAggregate(id);
  const result = await Promise.all(
    (post?.toSnapshot().comments || []).map(
      async (commentId: string) => await getCommentService(commentId),
    ),
  );
  res.json(result);
});
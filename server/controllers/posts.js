import { matchedData } from 'express-validator';
import Comment from '../models/comment.js';
import Post from '../models/post.js';

import { MONGO_IMAGE_ID } from '../constants/constants.js';
import {
  createPostService,
  deletePostService,
  getPostService,
  getPostsPaginationService,
  getPostsService,
  getUserPostsService,
  toggleLikePostService,
} from '../services/posts.js';
import {
  createFileUploadedRegisterService,
  deleteHardFileService,
} from '../services/storage.js';
import { handleHttpErrors } from '../utilities/handleHttpErrors.js';

export const getPosts = async (req, res) => {
  try {
    const posts = await getPostsService();
    return res.json(posts);
  } catch (error) {
    handleHttpErrors(res, 'ERROR_GET_POSTS');
  }
};

export const getPostsPagination = async (req, res) => {
  const limit = 2;
  const total = await Post.find({}).count();
  const pages = Math.ceil(total / limit);
  const page = !req.query.page ? 1 : req.query.page;
  const search = req.query.search;
  let start = (page - 1) * limit;

  const posts = await getPostsPaginationService(start, limit, search);

  return res.json(posts);
};

export const getPost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await getPostService(id);
    return res.json(post);
  } catch (error) {
    console.log(error);
    handleHttpErrors(res, 'ERROR_GET_POST');
  }
};
export const createUserPostFile = async (req, res) => {
  if (!req.file) return handleHttpErrors(res, 'ERROR_MISSING_FILE');

  const {
    file: { filename },
  } = req;
  const savedFileRegister = await createFileUploadedRegisterService(
    filename,
    req.image.secure_url
  );
  try {
    const body = matchedData(req);
    const newPost = await createPostService({
      ...body,
      fileId: savedFileRegister._id,
    });
    const newData = await getPostService(newPost._id);
    return res.json(newData[0]);
  } catch (error) {
    await deleteHardFileService(savedFileRegister._id);
    handleHttpErrors(res, 'ERROR_CREATE_POST');
  }
};
export const createUserPost = async (req, res) => {
  try {
    const body = matchedData(req);
    const newPost = await createPostService({
      ...body,
      fileId: MONGO_IMAGE_ID,
    });
    const newData = await getPostService(newPost._id);
    return res.json(newData[0]);
  } catch (error) {
    handleHttpErrors(res, 'ERROR_CREATE_POST');
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { id } = req.params;
    const posts = await getUserPostsService(id);
    return res.json(posts);
  } catch (error) {
    console.log({ error });
    handleHttpErrors(res, 'ERROR_GET_USER_POSTS');
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await deletePostService(id);
    return res.json(response);
  } catch (error) {
    console.log(error);
    handleHttpErrors(res, 'ERROR_DELETE_POST');
  }
};

export const toggleLikePost = async (req, res) => {
  try {
    const { id, userId } = matchedData(req);
    const response = await toggleLikePostService(id, userId);
    return res.json(response);
  } catch (error) {
    console.log(error);
    handleHttpErrors(res, 'ERROR_TOGGLE_LIKE_POST');
  }
};

export const getPostComments = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findById(id);
    const result = await Promise.all(
      post.comments.map(async (commentId) => await Comment.findById(commentId))
    );
    return res.json(result);
  } catch (error) {
    handleHttpErrors(res, 'ERROR_GET_POST_COMMENTS');
  }
};

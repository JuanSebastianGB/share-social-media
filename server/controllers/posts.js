import { matchedData } from 'express-validator';
import {
  createPostService,
  deletePostService,
  getPostService,
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
export const createUserPost = async (req, res) => {
  if (!req.file) return handleHttpErrors(res, 'ERROR_MISSING_FILE');
  const {
    file: { filename },
  } = req;
  const savedFileRegister = await createFileUploadedRegisterService(filename);
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

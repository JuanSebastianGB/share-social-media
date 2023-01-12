import mongoose from 'mongoose';
import Post from '../models/post.js';
import { deleteHardFileService } from './storage.js';

/**
 * It gets all posts, then gets the file associated with the post, then gets the user associated with
 * the post, then gets the profile image associated with the user, then projects the data into a new
 * object.
 */
const getPostsService = async () =>
  await Post.aggregate([
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $lookup: {
        from: 'storages',
        localField: 'fileId',
        foreignField: '_id',
        as: 'file',
      },
    },
    { $unwind: '$file' },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $unwind: '$user',
    },
    {
      $lookup: {
        from: 'storages',
        localField: 'user.profileImageId',
        foreignField: '_id',
        as: 'user.profileImage',
      },
    },
    {
      $unwind: '$user.profileImage',
    },
    {
      $project: {
        _id: 1,
        body: 1,
        likes: 1,
        comments: 1,
        'file._id': 1,
        'file.url': 1,
        'user._id': 1,
        'user.firstName': 1,
        'user.lastName': 1,
        'user.friends': 1,
        'user.location': 1,
        'user.occupation': 1,
        'user.viewedProfile': 1,
        'user.impressions': 1,
        'user.profileImage._id': 1,
        'user.profileImage.url': 1,
      },
    },
  ]);

/**
 * It takes a post id, finds the post, finds the file associated with the post, finds the user
 * associated with the post, finds the profile image associated with the user, and returns the post
 * with the file and user and profile image.
 * @param id - the id of the post
 */
const getPostService = async (id) =>
  await Post.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(id) } },
    {
      $lookup: {
        from: 'storages',
        localField: 'fileId',
        foreignField: '_id',
        as: 'file',
      },
    },
    { $unwind: '$file' },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $unwind: '$user',
    },
    {
      $lookup: {
        from: 'storages',
        localField: 'user.profileImageId',
        foreignField: '_id',
        as: 'user.profileImage',
      },
    },
    {
      $unwind: '$user.profileImage',
    },
    {
      $project: {
        _id: 1,
        body: 1,
        likes: 1,
        comments: 1,
        'file._id': 1,
        'file.url': 1,
        'user._id': 1,
        'user.firstName': 1,
        'user.lastName': 1,
        'user.friends': 1,
        'user.location': 1,
        'user.occupation': 1,
        'user.viewedProfile': 1,
        'user.impressions': 1,
        'user.profileImage._id': 1,
        'user.profileImage.url': 1,
      },
    },
  ]);

/**
 * Get all posts by a user, and include the user's profile image and the post's file
 * @param userId - The userId of the user whose posts we want to retrieve.
 */
const getUserPostsService = async (userId) =>
  await Post.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: 'storages',
        localField: 'fileId',
        foreignField: '_id',
        as: 'file',
      },
    },
    { $unwind: '$file' },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $unwind: '$user',
    },
    {
      $lookup: {
        from: 'storages',
        localField: 'user.profileImageId',
        foreignField: '_id',
        as: 'user.profileImage',
      },
    },
    {
      $unwind: '$user.profileImage',
    },
    {
      $project: {
        _id: 1,
        body: 1,
        likes: 1,
        comments: 1,
        userId: 1,
        'file._id': 1,
        'file.url': 1,
        'user._id': 1,
        'user.firstName': 1,
        'user.lastName': 1,
        'user.friends': 1,
        'user.location': 1,
        'user.occupation': 1,
        'user.viewedProfile': 1,
        'user.impressions': 1,
        'user.profileImage._id': 1,
        'user.profileImage.url': 1,
      },
    },
  ]);

/**
 * CreatePostService is a function that takes a body as an argument and returns a promise that resolves
 * to the result of calling Post.create with the body argument.
 * @param body - {
 */
const createPostService = async (body) => await Post.create(body);

/**
 * Delete a post by id, and delete the file associated with the post.
 * @param id - the id of the post
 * @returns The result of the deleteOne method.
 */
const deletePostService = async (id) => {
  const post = await getPostService(id);
  await deleteHardFileService(post.fileId);
  return await Post.deleteOne({ _id: id });
};

/**
 * It finds a post by id, then it checks if the user has liked the post, if so it deletes the like, if
 * not it adds the like.
 * @param id - the id of the post
 * @param userId - the id of the user who is liking the post
 * @returns The post object with the updated likes.
 */
const toggleLikePostService = async (id, userId) => {
  const post = await Post.findById(id);
  const isLikedPost = post.likes.get(userId);
  if (isLikedPost) post.likes.delete(userId);
  else post.likes.set(userId, true);
  return await post.save();
};

export {
  getPostsService,
  getPostService,
  getUserPostsService,
  createPostService,
  deletePostService,
  toggleLikePostService,
};

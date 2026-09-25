import { getUserByIdForAssembler } from '../../identity/index.js';
import { NotResourceOwnerError } from '../../shared/not-resource-owner-error.js';
import {
  deleteHardFileService,
  getFileService,
} from '../../../services/storage.js';
import type { DeleteResult } from '../../../types/entities.js';
import type { Post } from '../domain/post.js';
import type { PostSnapshot } from '../domain/post.js';
import { DynamoPostRepository } from '../infrastructure/dynamodb-post-repository.js';
import type { PostAssemblerDeps } from './read/post-assembler.js';
import { createPost as createPostUseCase } from './use-cases/create-post.js';
import { deletePost as deletePostUseCase } from './use-cases/delete-post.js';
import { attachCommentToPost as attachCommentToPostUseCase } from './use-cases/attach-comment-to-post.js';
import {
  countPosts as countPostsUseCase,
  getPost as getPostUseCase,
  listFeedPosts as listFeedPostsUseCase,
  listFeedPostsPage as listFeedPostsPageUseCase,
  listUserPosts as listUserPostsUseCase,
} from './use-cases/query-posts.js';
import { toggleLikePost as toggleLikePostUseCase } from './use-cases/toggle-like-post.js';

const postRepository = new DynamoPostRepository();

const assemblerDeps: PostAssemblerDeps = {
  getFile: async (fileId) => {
    const file = await getFileService(fileId);
    if (!file) return null;
    return { _id: String(file._id), url: file.url };
  },
  getUser: async (userId) => getUserByIdForAssembler(userId),
};

/** Legacy HTTP shape for non-hydrated post documents. */
export function toLegacyPostRecord(snapshot: PostSnapshot) {
  return {
    _id: snapshot.id,
    body: snapshot.body,
    userId: snapshot.authorId,
    fileId: snapshot.fileId,
    likes: snapshot.likes,
    comments: snapshot.comments,
    type: snapshot.type,
    createdAt: snapshot.createdAt,
    updatedAt: snapshot.updatedAt,
  };
}

export async function createPostService(body: Record<string, unknown>) {
  const post = await createPostUseCase(postRepository, {
    body: String(body.body ?? ''),
    authorId: String(body.userId),
    fileId: body.fileId ? String(body.fileId) : undefined,
    type: body.type ? String(body.type) : undefined,
    id: body._id ? String(body._id) : undefined,
  });
  return toLegacyPostRecord(post.toSnapshot());
}

export async function toggleLikePostService(id: string, userId: string) {
  const post = await toggleLikePostUseCase(postRepository, id, userId);
  if (!post) return null;
  return toLegacyPostRecord(post.toSnapshot());
}

export async function deletePostService(
  id: string,
  callerId: string,
): Promise<DeleteResult> {
  const post = await postRepository.findById(id);
  if (!post) {
    return { acknowledged: true, deletedCount: 0 };
  }
  const snapshot = post.toSnapshot();
  if (snapshot.authorId !== callerId) {
    throw new NotResourceOwnerError();
  }
  if (snapshot.fileId) await deleteHardFileService(String(snapshot.fileId));
  return deletePostUseCase(postRepository, id);
}

export const getPostsService = () =>
  listFeedPostsUseCase(postRepository, assemblerDeps);

export const getPostsPaginationService = (
  start: number,
  limit: number,
  search: string,
) => listFeedPostsPageUseCase(postRepository, assemblerDeps, start, limit, search);

export const getPostService = (id: string | unknown) =>
  getPostUseCase(postRepository, assemblerDeps, String(id));

export const getUserPostsService = (userId: string) =>
  listUserPostsUseCase(postRepository, assemblerDeps, userId);

export const countPostsService = () => countPostsUseCase(postRepository);

export async function findPostAggregate(id: string): Promise<Post | null> {
  return postRepository.findById(id);
}

export async function attachCommentToPostService(
  postId: string,
  commentId: string,
): Promise<Post | null> {
  return attachCommentToPostUseCase(postRepository, postId, commentId);
}

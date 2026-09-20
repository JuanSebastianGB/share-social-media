import type { CommentRepository } from '../ports/comment-repository.js';
import {
  createComment,
  type CreateCommentCommand,
} from './create-comment.js';

/** Feed attach seam — injectable for unit tests. */
export type AttachCommentPort = (
  postId: string,
  commentId: string,
) => Promise<unknown>;

/** Hydrated post read seam — injectable for unit tests. */
export type GetHydratedPostPort = (postId: string) => Promise<unknown[]>;

export type CreateCommentOnPostDeps = {
  attachComment: AttachCommentPort;
  getHydratedPost: GetHydratedPostPort;
};

export type CreateCommentOnPostCommand = CreateCommentCommand & {
  postId: string;
};

/**
 * HTTP create orchestration: save comment, attach id on Feed Post, return hydrated post.
 * Matches legacy `createItem` — returns `getPostService(postId)[0]`.
 */
export async function createCommentOnPost(
  repo: CommentRepository,
  deps: CreateCommentOnPostDeps,
  command: CreateCommentOnPostCommand,
): Promise<unknown> {
  const comment = await createComment(repo, command);
  const commentId = comment.toSnapshot().id;
  await deps.attachComment(command.postId, commentId);
  const data = await deps.getHydratedPost(command.postId);
  return data[0];
}

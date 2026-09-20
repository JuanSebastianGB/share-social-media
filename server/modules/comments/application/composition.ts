import {
  attachCommentToPostService,
  getPostService,
} from '../../feed/index.js';
import type { CommentSnapshot } from '../domain/comment.js';
import { DynamoCommentRepository } from '../infrastructure/dynamodb-comment-repository.js';
import { createCommentOnPost as createCommentOnPostUseCase } from './use-cases/create-comment-on-post.js';
import { createComment as createCommentUseCase } from './use-cases/create-comment.js';
import { deleteComment as deleteCommentUseCase } from './use-cases/delete-comment.js';
import { getComment as getCommentUseCase } from './use-cases/get-comment.js';
import { listComments as listCommentsUseCase } from './use-cases/list-comments.js';
import { updateComment as updateCommentUseCase } from './use-cases/update-comment.js';

const commentRepository = new DynamoCommentRepository();

/** Legacy HTTP shape for Comment documents. */
export function toLegacyCommentRecord(snapshot: CommentSnapshot) {
  return {
    _id: snapshot.id,
    description: snapshot.description,
    userId: snapshot.authorId,
    firstName: snapshot.firstName,
    lastName: snapshot.lastName,
    createdAt: snapshot.createdAt,
    updatedAt: snapshot.updatedAt,
  };
}

export async function listCommentsService() {
  const comments = await listCommentsUseCase(commentRepository);
  return comments.map((c) => toLegacyCommentRecord(c.toSnapshot()));
}

export async function getCommentService(id: string) {
  const comment = await getCommentUseCase(commentRepository, id);
  if (!comment) return null;
  return toLegacyCommentRecord(comment.toSnapshot());
}

export async function createCommentService(body: Record<string, unknown>) {
  const comment = await createCommentUseCase(commentRepository, {
    description: String(body.description ?? ''),
    authorId: String(body.userId ?? body.authorId ?? ''),
    firstName: String(body.firstName ?? ''),
    lastName: String(body.lastName ?? ''),
    id: body._id ? String(body._id) : undefined,
  });
  return toLegacyCommentRecord(comment.toSnapshot());
}

/**
 * HTTP create flow: save comment, attach to Feed post, return hydrated post[0].
 */
export async function createCommentOnPostService(input: {
  postId: string;
  body: Record<string, unknown>;
}) {
  return createCommentOnPostUseCase(
    commentRepository,
    {
      attachComment: (postId, commentId) =>
        attachCommentToPostService(postId, commentId),
      getHydratedPost: async (postId) => getPostService(postId),
    },
    {
      postId: input.postId,
      description: String(input.body.description ?? ''),
      authorId: String(input.body.userId ?? input.body.authorId ?? ''),
      firstName: String(input.body.firstName ?? ''),
      lastName: String(input.body.lastName ?? ''),
      id: input.body._id ? String(input.body._id) : undefined,
    },
  );
}

export async function updateCommentService(
  id: string,
  patch: Record<string, unknown>,
) {
  return updateCommentUseCase(commentRepository, id, patch);
}

export async function deleteCommentService(id: string) {
  return deleteCommentUseCase(commentRepository, id);
}

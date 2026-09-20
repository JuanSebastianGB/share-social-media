import type { CommentRepository } from '../ports/comment-repository.js';
import { Comment } from '../../domain/comment.js';
import { generateId } from '../../../../db/ids.js';

export type CreateCommentCommand = {
  description: string;
  authorId: string;
  firstName: string;
  lastName: string;
  id?: string;
};

export async function createComment(
  repo: CommentRepository,
  command: CreateCommentCommand,
): Promise<Comment> {
  const comment = Comment.create({
    id: command.id ?? generateId(),
    description: String(command.description ?? ''),
    authorId: command.authorId,
    firstName: String(command.firstName ?? ''),
    lastName: String(command.lastName ?? ''),
  });
  await repo.save(comment);
  return comment;
}

import type { PostRepository } from '../ports/post-repository.js';
import { Post } from '../../domain/post.js';
import { generateId } from '../../../../db/ids.js';

export type CreatePostCommand = {
  body: string;
  authorId: string;
  fileId?: string;
  type?: string;
  id?: string;
};

export async function createPost(
  repo: PostRepository,
  command: CreatePostCommand,
): Promise<Post> {
  const post = Post.create({
    id: command.id ?? generateId(),
    body: String(command.body ?? ''),
    authorId: command.authorId,
    fileId: command.fileId,
    type: command.type,
  });
  await repo.save(post);
  return post;
}

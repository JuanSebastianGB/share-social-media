import type { PostRepository } from '../ports/post-repository.js';
import type { Post } from '../../domain/post.js';

/**
 * Attaches a comment id to the Post aggregate (idempotent if already present).
 * Returns null when the post does not exist.
 */
export async function attachCommentToPost(
  repo: PostRepository,
  postId: string,
  commentId: string,
): Promise<Post | null> {
  const post = await repo.findById(postId);
  if (!post) return null;
  post.attachCommentId(commentId);
  await repo.save(post);
  return post;
}

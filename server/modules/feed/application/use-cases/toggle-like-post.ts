import type { PostRepository } from '../ports/post-repository.js';
import type { Post } from '../../domain/post.js';

export async function toggleLikePost(
  repo: PostRepository,
  postId: string,
  userId: string,
): Promise<Post | null> {
  const post = await repo.findById(postId);
  if (!post) return null;
  post.toggleLike(userId);
  await repo.save(post);
  return post;
}

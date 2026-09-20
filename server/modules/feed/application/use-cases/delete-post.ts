import type { PostRepository } from '../ports/post-repository.js';

export async function deletePost(
  repo: PostRepository,
  postId: string,
): Promise<{ acknowledged: true; deletedCount: number }> {
  const deleted = await repo.delete(postId);
  return { acknowledged: true, deletedCount: deleted ? 1 : 0 };
}

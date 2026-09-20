import { Post } from '../domain/post.js';
import type { PostRepository } from '../application/ports/post-repository.js';

/**
 * In-memory PostRepository for unit tests and local fakes.
 */
export class InMemoryPostRepository implements PostRepository {
  private readonly posts = new Map<string, Post>();

  async save(post: Post): Promise<void> {
    const snapshot = post.toSnapshot();
    this.posts.set(snapshot.id, Post.reconstitute(snapshot));
  }

  async findById(id: string): Promise<Post | null> {
    const post = this.posts.get(id);
    return post ? Post.reconstitute(post.toSnapshot()) : null;
  }

  async delete(id: string): Promise<boolean> {
    return this.posts.delete(id);
  }

  async listFeedIds(): Promise<string[]> {
    return [...this.posts.values()]
      .map((post) => post.toSnapshot())
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((snapshot) => snapshot.id);
  }

  async listUserPostIds(authorId: string): Promise<string[]> {
    return [...this.posts.values()]
      .map((post) => post.toSnapshot())
      .filter((snapshot) => snapshot.authorId === authorId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((snapshot) => snapshot.id);
  }

  async count(): Promise<number> {
    return this.posts.size;
  }

  clear(): void {
    this.posts.clear();
  }
}

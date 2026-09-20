import type { Post } from '../../domain/post.js';

/**
 * Persistence port for the Post aggregate (Feed BC).
 */
export interface PostRepository {
  save(post: Post): Promise<void>;
  findById(id: string): Promise<Post | null>;
  delete(id: string): Promise<boolean>;
  listFeedIds(): Promise<string[]>;
  listUserPostIds(authorId: string): Promise<string[]>;
  count(): Promise<number>;
}

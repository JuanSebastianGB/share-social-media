import type { Post } from '../../domain/post.js';

export type FeedIdPage = {
  ids: string[];
  continuation?: string;
};

/**
 * Persistence port for the Post aggregate (Feed BC).
 */
export interface PostRepository {
  save(post: Post): Promise<void>;
  findById(id: string): Promise<Post | null>;
  delete(id: string): Promise<boolean>;
  listFeedIds(): Promise<string[]>;
  queryFeedIds(input: {
    limit: number;
    continuation?: string;
  }): Promise<FeedIdPage>;
  listUserPostIds(authorId: string): Promise<string[]>;
  count(): Promise<number>;
}

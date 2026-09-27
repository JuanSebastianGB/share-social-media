import type { Post } from '../../domain/post.js';

/** GSI1 resume key shared by the Dynamo adapter and the in-memory fake. */
export type FeedPageCursor = {
  PK: string;
  SK: string;
  GSI1PK: string;
  GSI1SK: string;
};

export type FeedIdPage = {
  ids: string[];
  lastEvaluatedKey?: FeedPageCursor;
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
    exclusiveStartKey?: FeedPageCursor;
  }): Promise<FeedIdPage>;
  listUserPostIds(authorId: string): Promise<string[]>;
  count(): Promise<number>;
}

import { Post } from '../domain/post.js';
import type { PostSnapshot } from '../domain/post.js';
import type {
  FeedIdPage,
  PostRepository,
} from '../application/ports/post-repository.js';

const MEMORY_CURSOR_PREFIX = 'mem:';

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
    return this.orderedFeedIds();
  }

  async queryFeedIds(input: {
    limit: number;
    continuation?: string;
  }): Promise<FeedIdPage> {
    const ordered = this.orderedFeed();
    let start = 0;
    if (input.continuation !== undefined) {
      const afterId = decodeContinuation(input.continuation);
      if (afterId === undefined) return { ids: [] };
      const index = ordered.findIndex((snapshot) => snapshot.id === afterId);
      start = index >= 0 ? index + 1 : ordered.length;
    }
    const page = ordered.slice(start, start + input.limit);
    const last = page[page.length - 1];
    const hasMore = start + page.length < ordered.length;
    return {
      ids: page.map((snapshot) => snapshot.id),
      ...(hasMore && last
        ? { continuation: encodeContinuation(last.id) }
        : {}),
    };
  }

  private orderedFeed(): PostSnapshot[] {
    return [...this.posts.values()]
      .map((post) => post.toSnapshot())
      .sort(
        (a, b) =>
          b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id),
      );
  }

  private orderedFeedIds(): string[] {
    return this.orderedFeed().map((snapshot) => snapshot.id);
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

function encodeContinuation(afterId: string): string {
  return `${MEMORY_CURSOR_PREFIX}${Buffer.from(
    JSON.stringify({ afterId }),
  ).toString('base64url')}`;
}

function decodeContinuation(continuation: string): string | undefined {
  if (!continuation.startsWith(MEMORY_CURSOR_PREFIX)) return undefined;
  try {
    const raw = Buffer.from(
      continuation.slice(MEMORY_CURSOR_PREFIX.length),
      'base64url',
    ).toString('utf8');
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return undefined;
    }
    const afterId = (parsed as { afterId?: unknown }).afterId;
    return typeof afterId === 'string' ? afterId : undefined;
  } catch {
    return undefined;
  }
}

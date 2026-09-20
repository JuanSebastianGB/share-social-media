import { InvalidPostError } from './errors.js';

export type PostSnapshot = {
  id: string;
  body: string;
  authorId: string;
  fileId?: string;
  likes: Record<string, boolean>;
  comments: string[];
  type: string;
  createdAt: string;
  updatedAt: string;
};

export type CreatePostInput = {
  id: string;
  body: string;
  authorId: string;
  fileId?: string;
  type?: string;
  now?: string;
};

/**
 * Post aggregate root for the Feed bounded context.
 */
export class Post {
  private constructor(private readonly props: PostSnapshot) {}

  static create(input: CreatePostInput): Post {
    const body = input.body.trim();
    if (!body) {
      throw new InvalidPostError('Post body is required');
    }
    if (!input.authorId.trim()) {
      throw new InvalidPostError('Post author is required');
    }
    if (!input.id.trim()) {
      throw new InvalidPostError('Post id is required');
    }

    const now = input.now ?? new Date().toISOString();
    return new Post({
      id: input.id,
      body,
      authorId: input.authorId,
      fileId: input.fileId,
      likes: {},
      comments: [],
      type: input.type ?? 'file',
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(snapshot: PostSnapshot): Post {
    return new Post({
      ...snapshot,
      likes: { ...snapshot.likes },
      comments: [...snapshot.comments],
    });
  }

  toggleLike(userId: string): void {
    if (!userId.trim()) {
      throw new InvalidPostError('User id is required to like');
    }
    if (this.props.likes[userId]) {
      delete this.props.likes[userId];
    } else {
      this.props.likes[userId] = true;
    }
    this.touch();
  }

  attachCommentId(commentId: string): void {
    if (!commentId.trim()) {
      throw new InvalidPostError('Comment id is required');
    }
    if (this.props.comments.includes(commentId)) {
      return;
    }
    this.props.comments.push(commentId);
    this.touch();
  }

  toSnapshot(): PostSnapshot {
    return {
      ...this.props,
      likes: { ...this.props.likes },
      comments: [...this.props.comments],
    };
  }

  private touch(): void {
    this.props.updatedAt = new Date().toISOString();
  }
}

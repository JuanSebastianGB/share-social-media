import { InvalidCommentError } from './errors.js';

export type CommentSnapshot = {
  id: string;
  description: string;
  authorId: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateCommentInput = {
  id: string;
  description: string;
  authorId: string;
  firstName: string;
  lastName: string;
  now?: string;
};

/**
 * Comment aggregate root for the Comments bounded context.
 * No postId — attachment lives on the Feed Post aggregate.
 */
export class Comment {
  private constructor(private readonly props: CommentSnapshot) {}

  static create(input: CreateCommentInput): Comment {
    const description = input.description.trim();
    if (!description) {
      throw new InvalidCommentError('Comment description is required');
    }
    if (!input.authorId.trim()) {
      throw new InvalidCommentError('Comment author is required');
    }
    if (!input.id.trim()) {
      throw new InvalidCommentError('Comment id is required');
    }

    const now = input.now ?? new Date().toISOString();
    return new Comment({
      id: input.id,
      description,
      authorId: input.authorId,
      firstName: input.firstName,
      lastName: input.lastName,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(snapshot: CommentSnapshot): Comment {
    return new Comment({ ...snapshot });
  }

  updateDescription(description: string): void {
    const trimmed = description.trim();
    if (!trimmed) {
      throw new InvalidCommentError('Comment description is required');
    }
    this.props.description = trimmed;
    this.touch();
  }

  /**
   * Updates denormalized author display names (legacy PUT may patch these).
   */
  updateNames(firstName: string, lastName: string): void {
    this.props.firstName = firstName;
    this.props.lastName = lastName;
    this.touch();
  }

  toSnapshot(): CommentSnapshot {
    return { ...this.props };
  }

  private touch(): void {
    this.props.updatedAt = new Date().toISOString();
  }
}

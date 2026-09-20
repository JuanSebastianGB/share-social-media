import { InvalidFriendListError } from './errors.js';

export type FriendListSnapshot = {
  userId: string;
  friends: string[];
  createdAt: string;
  updatedAt: string;
};

export type CreateFriendListInput = {
  userId: string;
  friends?: string[];
  /** Injected clock for deterministic tests. */
  now?: string;
};

/**
 * FriendList aggregate root for the Social graph bounded context.
 * Owns friendship membership for one user; persist shape stays friends[] on USER.
 */
export class FriendList {
  private constructor(private readonly props: FriendListSnapshot) {}

  static create(input: CreateFriendListInput): FriendList {
    if (!input.userId.trim()) {
      throw new InvalidFriendListError('User id is required');
    }

    const now = input.now ?? new Date().toISOString();
    return new FriendList({
      userId: input.userId,
      friends: [...(input.friends ?? [])],
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(snapshot: FriendListSnapshot): FriendList {
    return new FriendList({
      ...snapshot,
      friends: [...snapshot.friends],
    });
  }

  /**
   * Toggles `friendId` on THIS user's friends list only.
   * Bidirectional peer mutation belongs in the use case (later slice).
   */
  toggleFriend(friendId: string): void {
    if (!friendId.trim()) {
      throw new InvalidFriendListError('Friend id is required');
    }
    if (friendId === this.props.userId) {
      throw new InvalidFriendListError('Cannot friend yourself');
    }

    const index = this.props.friends.indexOf(friendId);
    if (index >= 0) {
      this.props.friends.splice(index, 1);
    } else {
      this.props.friends.push(friendId);
    }
    this.touch();
  }

  toSnapshot(): FriendListSnapshot {
    return {
      ...this.props,
      friends: [...this.props.friends],
    };
  }

  private touch(): void {
    this.props.updatedAt = new Date().toISOString();
  }
}

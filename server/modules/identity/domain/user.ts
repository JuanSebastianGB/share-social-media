import { InvalidUserError } from './errors.js';

export type UserSnapshot = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  location?: string;
  occupation?: string;
  role: string | string[];
  friends: string[];
  /** Opaque password hash for local auth only — domain never hashes. */
  password?: string;
  cognitoSub?: string;
  age?: number;
  viewedProfile?: number;
  impressions?: number;
  profileImageId?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateUserInput = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  location?: string;
  occupation?: string;
  role?: string | string[];
  friends?: string[];
  password?: string;
  cognitoSub?: string;
  age?: number;
  viewedProfile?: number;
  impressions?: number;
  profileImageId?: string;
  /** Injected clock for deterministic tests. */
  now?: string;
};

/**
 * User aggregate root for the Identity bounded context.
 * Approach B: friends[] lives on this aggregate for this slice.
 */
export class User {
  private constructor(private readonly props: UserSnapshot) {}

  static create(input: CreateUserInput): User {
    if (!input.id.trim()) {
      throw new InvalidUserError('User id is required');
    }
    const email = input.email.trim().toLowerCase();
    if (!email) {
      throw new InvalidUserError('User email is required');
    }

    const now = input.now ?? new Date().toISOString();
    return new User({
      id: input.id,
      email,
      firstName: input.firstName,
      lastName: input.lastName,
      username: input.username,
      location: input.location,
      occupation: input.occupation,
      role: input.role ?? 'user',
      friends: [...(input.friends ?? [])],
      password: input.password,
      cognitoSub: input.cognitoSub,
      age: input.age,
      viewedProfile: input.viewedProfile,
      impressions: input.impressions,
      profileImageId: input.profileImageId,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(snapshot: UserSnapshot): User {
    return new User({
      ...snapshot,
      friends: [...snapshot.friends],
    });
  }

  /**
   * Toggles `friendId` on THIS user's friends list only.
   * Legacy HTTP mutates both peers; the use case (T4) loads each aggregate
   * and calls `toggleFriend` with the peer id.
   */
  toggleFriend(friendId: string): void {
    if (!friendId.trim()) {
      throw new InvalidUserError('Friend id is required');
    }
    if (friendId === this.props.id) {
      throw new InvalidUserError('Cannot friend yourself');
    }

    const index = this.props.friends.indexOf(friendId);
    if (index >= 0) {
      this.props.friends.splice(index, 1);
    } else {
      this.props.friends.push(friendId);
    }
    this.touch();
  }

  toSnapshot(): UserSnapshot {
    return {
      ...this.props,
      friends: [...this.props.friends],
    };
  }

  private touch(): void {
    this.props.updatedAt = new Date().toISOString();
  }
}

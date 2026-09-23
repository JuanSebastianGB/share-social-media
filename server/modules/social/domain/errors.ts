export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class InvalidFriendListError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidFriendListError';
  }
}

/**
 * Thrown when toggling friendship requires a USER row that does not exist
 * (either the actor or the friend). The errorMapper middleware maps this
 * to a 404 with body `ERROR_TOGGLE_FRIEND`.
 */
export class UserOrFriendNotFoundError extends DomainError {
  constructor() {
    super('USER_OR_FRIEND_NOT_FOUND');
    this.name = 'UserOrFriendNotFoundError';
  }
}
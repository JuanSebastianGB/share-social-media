export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class InvalidPostError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPostError';
  }
}

/**
 * Identity bounded context public facade.
 * Scaffolding only — use cases are wired in a later strangler slice.
 */
export { InvalidUserError, DomainError } from './domain/errors.js';
export { User } from './domain/user.js';
export type { UserSnapshot, CreateUserInput } from './domain/user.js';
export type { UserRepository } from './application/ports/user-repository.js';
export { DynamoUserRepository } from './infrastructure/dynamodb-user-repository.js';
export { InMemoryUserRepository } from './infrastructure/in-memory-user-repository.js';

/**
 * Identity bounded context public facade.
 * Scaffolding only — use cases and adapters are wired as the strangler migration progresses.
 */
export { InvalidUserError, DomainError } from './domain/errors.js';
export { User } from './domain/user.js';
export type { UserSnapshot, CreateUserInput } from './domain/user.js';

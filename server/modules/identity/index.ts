/**
 * Identity bounded context public facade.
 */
export { InvalidUserError, DomainError } from './domain/errors.js';
export { User } from './domain/user.js';
export type { UserSnapshot, CreateUserInput } from './domain/user.js';
export type { UserRepository } from './application/ports/user-repository.js';
export { DynamoUserRepository } from './infrastructure/dynamodb-user-repository.js';
export { InMemoryUserRepository } from './infrastructure/in-memory-user-repository.js';
export {
  registerService,
  completeProfileService,
  getUserByCognitoSubService,
  getUsersService,
  getUserService,
  getUserFromEmailService,
  getUserByIdForAssembler,
  toLegacyUserRecord,
} from './application/composition.js';

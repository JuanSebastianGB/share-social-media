import type { User } from '../../domain/user.js';
import type { UserRepository } from '../ports/user-repository.js';

export async function findUserByCognitoSub(
  repo: UserRepository,
  cognitoSub: string,
): Promise<User | null> {
  return repo.findByCognitoSub(cognitoSub);
}

import type { User } from '../../domain/user.js';
import type { UserRepository } from '../ports/user-repository.js';

export async function findUserByEmail(
  repo: UserRepository,
  email: string,
): Promise<User | null> {
  return repo.findByEmail(email);
}

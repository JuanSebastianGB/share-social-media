import type { User } from '../../domain/user.js';
import type { UserRepository } from '../ports/user-repository.js';

export async function findUserById(
  repo: UserRepository,
  id: string,
): Promise<User | null> {
  return repo.findById(id);
}

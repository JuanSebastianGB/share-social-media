import type { User } from '../../domain/user.js';
import type { UserRepository } from '../ports/user-repository.js';

export async function listUsers(repo: UserRepository): Promise<User[]> {
  return repo.list();
}

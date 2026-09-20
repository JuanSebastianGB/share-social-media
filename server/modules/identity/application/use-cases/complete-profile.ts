import type { User } from '../../domain/user.js';
import type { UserRepository } from '../ports/user-repository.js';
import {
  registerUser,
  type RegisterUserCommand,
} from './register-user.js';

export type CompleteProfileCommand = Omit<
  RegisterUserCommand,
  'cognitoSub' | 'password'
>;

export type CompleteProfileResult = {
  user: User;
  created: boolean;
};

/**
 * Cognito profile completion: return existing profile or create one linked to sub.
 */
export async function completeProfile(
  repo: UserRepository,
  cognitoSub: string,
  command: CompleteProfileCommand,
): Promise<CompleteProfileResult> {
  const existing = await repo.findByCognitoSub(cognitoSub);
  if (existing) {
    return { user: existing, created: false };
  }

  const user = await registerUser(repo, {
    ...command,
    cognitoSub,
  });
  return { user, created: true };
}

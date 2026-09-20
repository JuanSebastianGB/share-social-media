import { generateId } from '../../../../db/ids.js';
import { User } from '../../domain/user.js';
import type { UserRepository } from '../ports/user-repository.js';

export type RegisterUserCommand = {
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  location?: string;
  occupation?: string;
  role?: string | string[];
  friends?: string[];
  /** Already hashed by the caller (local auth). */
  password?: string;
  cognitoSub?: string;
  age?: number;
  viewedProfile?: number;
  impressions?: number;
  profileImageId?: string;
  id?: string;
};

/**
 * Creates a User aggregate and persists it.
 * Password hashing is the caller's responsibility.
 */
export async function registerUser(
  repo: UserRepository,
  command: RegisterUserCommand,
): Promise<User> {
  const user = User.create({
    id: command.id ?? generateId(),
    email: command.email,
    firstName: command.firstName,
    lastName: command.lastName,
    username: command.username,
    location: command.location,
    occupation: command.occupation,
    role: command.role,
    friends: command.friends,
    password: command.password,
    cognitoSub: command.cognitoSub,
    age: command.age,
    viewedProfile: command.viewedProfile,
    impressions: command.impressions,
    profileImageId: command.profileImageId,
  });
  await repo.save(user);
  return user;
}

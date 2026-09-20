import type { User } from '../../domain/user.js';

/**
 * Persistence port for the User aggregate (Identity BC).
 * Updates go through domain mutation then `save` — no `update()` on the port.
 */
export interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByCognitoSub(cognitoSub: string): Promise<User | null>;
  /** Returns false when the user does not exist. */
  delete(id: string): Promise<boolean>;
  /**
   * All users. Order is not guaranteed (mirrors legacy DynamoDB Scan).
   */
  list(): Promise<User[]>;
}

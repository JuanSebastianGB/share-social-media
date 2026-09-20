import { User } from '../domain/user.js';
import type { UserRepository } from '../application/ports/user-repository.js';

/**
 * In-memory UserRepository for unit tests and local fakes.
 * Indexes email (normalized lower) and cognitoSub for lookups.
 */
export class InMemoryUserRepository implements UserRepository {
  private readonly users = new Map<string, User>();
  private readonly byEmail = new Map<string, string>();
  private readonly byCognitoSub = new Map<string, string>();

  async save(user: User): Promise<void> {
    const snapshot = user.toSnapshot();
    const previous = this.users.get(snapshot.id);

    if (previous) {
      const prev = previous.toSnapshot();
      if (prev.email !== snapshot.email) {
        this.byEmail.delete(normalizeEmail(prev.email));
      }
      if (prev.cognitoSub && prev.cognitoSub !== snapshot.cognitoSub) {
        this.byCognitoSub.delete(prev.cognitoSub);
      }
    }

    this.users.set(snapshot.id, User.reconstitute(snapshot));
    this.byEmail.set(normalizeEmail(snapshot.email), snapshot.id);
    if (snapshot.cognitoSub) {
      this.byCognitoSub.set(snapshot.cognitoSub, snapshot.id);
    }
  }

  async findById(id: string): Promise<User | null> {
    const user = this.users.get(id);
    return user ? User.reconstitute(user.toSnapshot()) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const id = this.byEmail.get(normalizeEmail(email));
    if (!id) return null;
    return this.findById(id);
  }

  async findByCognitoSub(cognitoSub: string): Promise<User | null> {
    const id = this.byCognitoSub.get(cognitoSub);
    if (!id) return null;
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const existing = this.users.get(id);
    if (!existing) return false;

    const snapshot = existing.toSnapshot();
    this.users.delete(id);
    this.byEmail.delete(normalizeEmail(snapshot.email));
    if (snapshot.cognitoSub) {
      this.byCognitoSub.delete(snapshot.cognitoSub);
    }
    return true;
  }

  /**
   * Returns all users. Order is not guaranteed (mirrors legacy DynamoDB Scan).
   */
  async list(): Promise<User[]> {
    return [...this.users.values()].map((user) =>
      User.reconstitute(user.toSnapshot()),
    );
  }

  clear(): void {
    this.users.clear();
    this.byEmail.clear();
    this.byCognitoSub.clear();
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

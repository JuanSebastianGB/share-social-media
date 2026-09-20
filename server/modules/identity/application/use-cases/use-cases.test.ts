import { InMemoryUserRepository } from '../../infrastructure/in-memory-user-repository.js';
import { completeProfile } from './complete-profile.js';
import { findUserByCognitoSub } from './find-user-by-cognito-sub.js';
import { findUserByEmail } from './find-user-by-email.js';
import { findUserById } from './find-user-by-id.js';
import { listUsers } from './list-users.js';
import { registerUser } from './register-user.js';
import { toggleFriendship } from './toggle-friendship.js';

describe('Identity use cases', () => {
  const repo = new InMemoryUserRepository();
  const userId = '507f1f77bcf86cd799439011';
  const friendId = '507f1f77bcf86cd799439012';

  beforeEach(() => {
    repo.clear();
  });

  test('registerUser — persists aggregate and returns it', async () => {
    const user = await registerUser(repo, {
      id: userId,
      email: 'ada@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      password: 'hashed-password',
    });

    expect(user.toSnapshot().email).toBe('ada@example.com');
    expect(user.toSnapshot().password).toBe('hashed-password');
    const found = await repo.findById(userId);
    expect(found).not.toBeNull();
  });

  test('registerUser — when id omitted — generates id and persists', async () => {
    const user = await registerUser(repo, {
      email: 'grace@example.com',
      firstName: 'Grace',
    });

    const id = user.toSnapshot().id;
    expect(id.length).toBeGreaterThan(0);
    expect(await repo.findById(id)).not.toBeNull();
  });

  test('completeProfile — when missing — creates with cognitoSub', async () => {
    const result = await completeProfile(repo, 'sub-1', {
      email: 'cog@example.com',
      firstName: 'Cog',
      lastName: 'Nito',
      profileImageId: 'img-1',
    });

    expect(result.created).toBe(true);
    expect(result.user.toSnapshot().cognitoSub).toBe('sub-1');
    expect(await repo.findByCognitoSub('sub-1')).not.toBeNull();
  });

  test('completeProfile — when exists — returns created false', async () => {
    await registerUser(repo, {
      id: userId,
      email: 'cog@example.com',
      cognitoSub: 'sub-1',
    });

    const result = await completeProfile(repo, 'sub-1', {
      email: 'other@example.com',
      firstName: 'Other',
    });

    expect(result.created).toBe(false);
    expect(result.user.toSnapshot().id).toBe(userId);
    expect(result.user.toSnapshot().email).toBe('cog@example.com');
  });

  test('findUserById — when missing — returns null', async () => {
    expect(await findUserById(repo, userId)).toBeNull();
  });

  test('findUserById — when present — returns aggregate', async () => {
    await registerUser(repo, { id: userId, email: 'a@example.com' });
    const found = await findUserById(repo, userId);
    expect(found?.toSnapshot().email).toBe('a@example.com');
  });

  test('findUserByEmail — finds by normalized email', async () => {
    await registerUser(repo, { id: userId, email: 'Ada@Example.COM' });
    const found = await findUserByEmail(repo, 'ada@example.com');
    expect(found?.toSnapshot().id).toBe(userId);
  });

  test('findUserByCognitoSub — finds linked profile', async () => {
    await registerUser(repo, {
      id: userId,
      email: 'c@example.com',
      cognitoSub: 'sub-x',
    });
    const found = await findUserByCognitoSub(repo, 'sub-x');
    expect(found?.toSnapshot().id).toBe(userId);
  });

  test('listUsers — returns all persisted users', async () => {
    await registerUser(repo, { id: userId, email: 'one@example.com' });
    await registerUser(repo, { id: friendId, email: 'two@example.com' });

    const listed = await listUsers(repo);
    expect(listed).toHaveLength(2);
    expect(listed.map((u) => u.toSnapshot().email).sort()).toEqual([
      'one@example.com',
      'two@example.com',
    ]);
  });

  test('toggleFriendship — when either missing — throws USER_OR_FRIEND_NOT_FOUND', async () => {
    await registerUser(repo, { id: userId, email: 'a@example.com' });
    await expect(toggleFriendship(repo, userId, friendId)).rejects.toThrow(
      'USER_OR_FRIEND_NOT_FOUND',
    );
  });

  test('toggleFriendship — adds then removes on both peers', async () => {
    await registerUser(repo, { id: userId, email: 'a@example.com' });
    await registerUser(repo, { id: friendId, email: 'b@example.com' });

    const afterAdd = await toggleFriendship(repo, userId, friendId);
    expect(afterAdd.toSnapshot().friends).toEqual([friendId]);
    expect((await repo.findById(friendId))!.toSnapshot().friends).toEqual([
      userId,
    ]);

    const afterRemove = await toggleFriendship(repo, userId, friendId);
    expect(afterRemove.toSnapshot().friends).toEqual([]);
    expect((await repo.findById(friendId))!.toSnapshot().friends).toEqual([]);
  });
});

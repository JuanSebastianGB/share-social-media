import { User } from '../domain/user.js';
import { InMemoryUserRepository } from './in-memory-user-repository.js';

describe('InMemoryUserRepository', () => {
  const repo = new InMemoryUserRepository();

  beforeEach(() => {
    repo.clear();
  });

  test('when user is saved — findById returns reconstituted aggregate', async () => {
    const user = User.create({
      id: '507f1f77bcf86cd799439011',
      email: 'ada@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      friends: ['507f1f77bcf86cd799439099'],
      now: '2026-02-01T00:00:00.000Z',
    });
    await repo.save(user);

    const found = await repo.findById(user.toSnapshot().id);
    expect(found?.toSnapshot()).toEqual({
      id: '507f1f77bcf86cd799439011',
      email: 'ada@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      username: undefined,
      location: undefined,
      occupation: undefined,
      role: 'user',
      friends: ['507f1f77bcf86cd799439099'],
      password: undefined,
      cognitoSub: undefined,
      age: undefined,
      viewedProfile: undefined,
      impressions: undefined,
      profileImageId: undefined,
      createdAt: '2026-02-01T00:00:00.000Z',
      updatedAt: '2026-02-01T00:00:00.000Z',
    });
  });

  test('findById returns null when missing', async () => {
    expect(await repo.findById('missing')).toBeNull();
  });

  test('findByEmail looks up normalized lowercase email', async () => {
    const user = User.create({
      id: '507f1f77bcf86cd799439021',
      email: 'Ada@Example.COM',
      now: '2026-02-01T00:00:00.000Z',
    });
    await repo.save(user);

    const found = await repo.findByEmail('  ADA@example.com  ');
    expect(found?.toSnapshot().id).toBe('507f1f77bcf86cd799439021');
    expect(await repo.findByEmail('missing@example.com')).toBeNull();
  });

  test('findByCognitoSub returns user when cognitoSub is indexed', async () => {
    const user = User.create({
      id: '507f1f77bcf86cd799439031',
      email: 'cognito@example.com',
      cognitoSub: 'cognito-sub-abc',
      now: '2026-02-01T00:00:00.000Z',
    });
    await repo.save(user);

    const found = await repo.findByCognitoSub('cognito-sub-abc');
    expect(found?.toSnapshot().id).toBe('507f1f77bcf86cd799439031');
    expect(await repo.findByCognitoSub('missing-sub')).toBeNull();
  });

  test('delete returns false when missing and true when present; clears indexes', async () => {
    const user = User.create({
      id: '507f1f77bcf86cd799439041',
      email: 'delete-me@example.com',
      cognitoSub: 'sub-to-delete',
      now: '2026-02-01T00:00:00.000Z',
    });
    await repo.save(user);

    expect(await repo.delete('missing')).toBe(false);
    expect(await repo.delete(user.toSnapshot().id)).toBe(true);
    expect(await repo.findById(user.toSnapshot().id)).toBeNull();
    expect(await repo.findByEmail('delete-me@example.com')).toBeNull();
    expect(await repo.findByCognitoSub('sub-to-delete')).toBeNull();
  });

  test('list returns all saved users (unsorted — mirrors legacy Scan)', async () => {
    const first = User.create({
      id: '507f1f77bcf86cd799439051',
      email: 'first@example.com',
      now: '2026-01-01T00:00:00.000Z',
    });
    const second = User.create({
      id: '507f1f77bcf86cd799439052',
      email: 'second@example.com',
      now: '2026-03-01T00:00:00.000Z',
    });
    await repo.save(first);
    await repo.save(second);

    const listed = await repo.list();
    const ids = listed.map((u) => u.toSnapshot().id).sort();
    expect(ids).toEqual([
      '507f1f77bcf86cd799439051',
      '507f1f77bcf86cd799439052',
    ]);
  });

  test('domain toggleFriend then save persists friends', async () => {
    const user = User.create({
      id: '507f1f77bcf86cd799439061',
      email: 'friends@example.com',
      now: '2026-02-01T00:00:00.000Z',
    });
    await repo.save(user);

    const loaded = await repo.findById(user.toSnapshot().id);
    loaded!.toggleFriend('507f1f77bcf86cd799439099');
    await repo.save(loaded!);

    const found = await repo.findById(user.toSnapshot().id);
    expect(found?.toSnapshot().friends).toEqual([
      '507f1f77bcf86cd799439099',
    ]);
  });
});

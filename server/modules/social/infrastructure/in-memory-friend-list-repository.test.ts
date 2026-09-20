import { FriendList } from '../domain/friend-list.js';
import { InMemoryFriendListRepository } from './in-memory-friend-list-repository.js';

describe('InMemoryFriendListRepository', () => {
  const repo = new InMemoryFriendListRepository();

  beforeEach(() => {
    repo.clear();
  });

  test('when friend list is saved — findByUserId returns reconstituted aggregate', async () => {
    const friendList = FriendList.create({
      userId: '507f1f77bcf86cd799439011',
      friends: ['507f1f77bcf86cd799439099'],
      now: '2026-02-01T00:00:00.000Z',
    });
    await repo.save(friendList);

    const found = await repo.findByUserId(friendList.toSnapshot().userId);
    expect(found?.toSnapshot()).toEqual({
      userId: '507f1f77bcf86cd799439011',
      friends: ['507f1f77bcf86cd799439099'],
      createdAt: '2026-02-01T00:00:00.000Z',
      updatedAt: '2026-02-01T00:00:00.000Z',
    });
  });

  test('findByUserId returns null when missing', async () => {
    expect(await repo.findByUserId('missing')).toBeNull();
  });

  test('save overwrites friends for the same userId', async () => {
    const initial = FriendList.create({
      userId: '507f1f77bcf86cd799439021',
      friends: ['507f1f77bcf86cd799439001'],
      now: '2026-02-01T00:00:00.000Z',
    });
    await repo.save(initial);

    const replacement = FriendList.reconstitute({
      userId: '507f1f77bcf86cd799439021',
      friends: ['507f1f77bcf86cd799439002', '507f1f77bcf86cd799439003'],
      createdAt: '2026-02-01T00:00:00.000Z',
      updatedAt: '2026-03-01T00:00:00.000Z',
    });
    await repo.save(replacement);

    const found = await repo.findByUserId('507f1f77bcf86cd799439021');
    expect(found?.toSnapshot().friends).toEqual([
      '507f1f77bcf86cd799439002',
      '507f1f77bcf86cd799439003',
    ]);
    expect(found?.toSnapshot().updatedAt).toBe('2026-03-01T00:00:00.000Z');
  });

  test('findByUserId returns a copy of friends — mutating result does not affect store', async () => {
    const friendList = FriendList.create({
      userId: '507f1f77bcf86cd799439031',
      friends: ['507f1f77bcf86cd799439099'],
      now: '2026-02-01T00:00:00.000Z',
    });
    await repo.save(friendList);

    const found = await repo.findByUserId('507f1f77bcf86cd799439031');
    found!.toggleFriend('507f1f77bcf86cd799439088');

    const stored = await repo.findByUserId('507f1f77bcf86cd799439031');
    expect(stored?.toSnapshot().friends).toEqual([
      '507f1f77bcf86cd799439099',
    ]);
  });
});

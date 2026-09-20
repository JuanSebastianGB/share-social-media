import { FriendList } from '../../domain/friend-list.js';
import { InMemoryFriendListRepository } from '../../infrastructure/in-memory-friend-list-repository.js';
import { toggleFriendship } from './toggle-friendship.js';

describe('Social use cases', () => {
  const repo = new InMemoryFriendListRepository();
  const actorId = '507f1f77bcf86cd799439011';
  const friendId = '507f1f77bcf86cd799439012';

  beforeEach(() => {
    repo.clear();
  });

  test('toggleFriendship — when either missing — throws USER_OR_FRIEND_NOT_FOUND', async () => {
    await repo.save(FriendList.create({ userId: actorId }));

    await expect(toggleFriendship(repo, actorId, friendId)).rejects.toThrow(
      'USER_OR_FRIEND_NOT_FOUND',
    );
  });

  test('toggleFriendship — adds then removes on both peers', async () => {
    await repo.save(FriendList.create({ userId: actorId }));
    await repo.save(FriendList.create({ userId: friendId }));

    const afterAdd = await toggleFriendship(repo, actorId, friendId);
    expect(afterAdd.toSnapshot().friends).toEqual([friendId]);
    expect((await repo.findByUserId(friendId))!.toSnapshot().friends).toEqual([
      actorId,
    ]);

    const afterRemove = await toggleFriendship(repo, actorId, friendId);
    expect(afterRemove.toSnapshot().friends).toEqual([]);
    expect((await repo.findByUserId(friendId))!.toSnapshot().friends).toEqual(
      [],
    );
  });
});

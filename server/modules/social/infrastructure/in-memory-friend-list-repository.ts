import { FriendList } from '../domain/friend-list.js';
import type { FriendListRepository } from '../application/ports/friend-list-repository.js';

/**
 * In-memory FriendListRepository for unit tests and local fakes.
 */
export class InMemoryFriendListRepository implements FriendListRepository {
  private readonly lists = new Map<string, FriendList>();

  async save(friendList: FriendList): Promise<void> {
    const snapshot = friendList.toSnapshot();
    this.lists.set(snapshot.userId, FriendList.reconstitute(snapshot));
  }

  async findByUserId(userId: string): Promise<FriendList | null> {
    const list = this.lists.get(userId);
    return list ? FriendList.reconstitute(list.toSnapshot()) : null;
  }

  clear(): void {
    this.lists.clear();
  }
}

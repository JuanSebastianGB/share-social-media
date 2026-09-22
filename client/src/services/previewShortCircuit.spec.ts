import { Api } from '@/interceptors';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  fetchFriendsService,
} from './friends.service';
import { fetchPostsService, fetchUserPostsService } from './posts.service';
import { fetchUserService } from './user.service';

vi.mock('@/utilities', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/utilities')>();
  return {
    ...actual,
    isLocalPreviewEnabled: vi.fn(),
  };
});

vi.mock('@/interceptors', () => ({
  Api: {
    get: vi.fn(),
  },
  ApiJson: {
    post: vi.fn(),
    put: vi.fn(),
  },
}));

import {
  buildLocalPreviewUserFromLogin,
  isLocalPreviewEnabled,
  saveLocalPreviewUser,
} from '@/utilities';

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return [...store.keys()][index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
  };
}

describe('preview service short-circuits', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: createMemoryStorage(),
      configurable: true,
      writable: true,
    });
    vi.mocked(isLocalPreviewEnabled).mockReturnValue(true);
    vi.mocked(Api.get).mockReset();
  });

  it('fetchUserService returns preview user without HTTP when id matches', async () => {
    const user = buildLocalPreviewUserFromLogin({
      email: 'preview@example.com',
      password: 'x',
    });
    saveLocalPreviewUser(user);

    await expect(fetchUserService(user._id)).resolves.toEqual(user);
    expect(Api.get).not.toHaveBeenCalled();
  });

  it('fetchUserService throws without HTTP when id mismatches', async () => {
    const user = buildLocalPreviewUserFromLogin({
      email: 'preview@example.com',
      password: 'x',
    });
    saveLocalPreviewUser(user);

    await expect(fetchUserService('other-id')).rejects.toThrow(
      'Local preview user not found',
    );
    expect(Api.get).not.toHaveBeenCalled();
  });

  it('fetchPostsService returns empty list without HTTP', async () => {
    await expect(fetchPostsService(1, '', {})).resolves.toEqual([]);
    expect(Api.get).not.toHaveBeenCalled();
  });

  it('fetchUserPostsService returns empty list without HTTP', async () => {
    await expect(fetchUserPostsService('any-id', {})).resolves.toEqual([]);
    expect(Api.get).not.toHaveBeenCalled();
  });

  it('fetchFriendsService returns empty list without HTTP', async () => {
    await expect(fetchFriendsService('any-id')).resolves.toEqual([]);
    expect(Api.get).not.toHaveBeenCalled();
  });
});

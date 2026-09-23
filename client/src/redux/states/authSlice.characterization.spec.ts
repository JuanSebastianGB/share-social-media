import { authEmptyState, emptyUserApiModel, type UserApiModel } from '@/models';
import {
  buildLocalPreviewUserFromLogin,
  LOCAL_PREVIEW_STORAGE_KEY,
  saveLocalPreviewUser,
} from '@/shared/lib/utilities';
import { beforeEach, describe, expect, it } from 'vitest';
import authReducer, { makeLogin, makeLogout } from './authSlice';

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

const adaUser: UserApiModel = {
  _id: 'u1',
  firstName: 'Ada',
  lastName: '',
  role: [],
  friends: [],
  viewedProfile: 0,
  impressions: 0,
  profileImage: {
    _id: '',
    url: '',
    deleted: false,
    createdAt: new Date(0),
    updatedAt: new Date(0),
  },
  email: 'ada@example.com',
  location: '',
  occupation: '',
  picturePath: '',
};

// Captured on: 2026-09-20 from feat/client-unit-tests
// Known bugs: none recorded

// characterization: documents current behavior, NOT intended spec
describe('authSlice characterization', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: createMemoryStorage(),
      configurable: true,
      writable: true,
    });
  });

  it('makeLogin with user and token — stores user and token on state', () => {
    // Arrange
    const previous = { ...authEmptyState };
    const payload = { user: adaUser, token: 'jwt-token' };

    // Act
    const next = authReducer(previous, makeLogin(payload));

    // Assert
    expect(next.user).toEqual(payload.user);
    expect(next.token).toBe('jwt-token');
  });

  it('makeLogout after login — clears user to empty and token to empty string', () => {
    // Arrange
    const previous = { user: adaUser, token: 'jwt-token' };

    // Act
    const next = authReducer(previous, makeLogout({}));

    // Assert
    expect(next.user).toEqual(emptyUserApiModel);
    expect(next.token).toBe('');
  });

  it('makeLogout clears local preview storage', () => {
    const previewUser = buildLocalPreviewUserFromLogin({
      email: 'preview@example.com',
      password: 'ignored',
    });
    saveLocalPreviewUser(previewUser);
    expect(localStorage.getItem(LOCAL_PREVIEW_STORAGE_KEY)).toBeTruthy();

    authReducer(
      { user: adaUser, token: 'local-preview' },
      makeLogout({}),
    );

    expect(localStorage.getItem(LOCAL_PREVIEW_STORAGE_KEY)).toBeNull();
  });
});
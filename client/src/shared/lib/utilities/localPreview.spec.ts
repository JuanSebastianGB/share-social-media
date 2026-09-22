import { beforeEach, describe, expect, it } from 'vitest';
import {
  buildLocalPreviewUserFromLogin,
  buildLocalPreviewUserFromRegister,
  clearLocalPreviewUser,
  createLocalPreviewSessionFromLogin,
  createLocalPreviewSessionFromRegister,
  isLocalPreviewEnabled,
  LOCAL_PREVIEW_STORAGE_KEY,
  LOCAL_PREVIEW_TOKEN,
  readLocalPreviewUser,
  resolvePreviewUserOrThrow,
  saveLocalPreviewUser,
} from './localPreview';

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

describe('localPreview', () => {
  beforeEach(() => {
    // Node 25+ may expose a non-functional global localStorage; use a real store.
    Object.defineProperty(globalThis, 'localStorage', {
      value: createMemoryStorage(),
      configurable: true,
      writable: true,
    });
  });

  describe('isLocalPreviewEnabled', () => {
    it('flag unset — returns false', () => {
      expect(isLocalPreviewEnabled({ DEV: true })).toBe(false);
    });

    it('flag not the string true — returns false', () => {
      expect(
        isLocalPreviewEnabled({ DEV: true, VITE_LOCAL_PREVIEW: '1' }),
      ).toBe(false);
    });

    it('flag on while DEV — returns true', () => {
      expect(
        isLocalPreviewEnabled({ DEV: true, VITE_LOCAL_PREVIEW: 'true' }),
      ).toBe(true);
    });

    it('flag on while DEV false — returns false', () => {
      expect(
        isLocalPreviewEnabled({ DEV: false, VITE_LOCAL_PREVIEW: 'true' }),
      ).toBe(false);
    });
  });

  describe('buildLocalPreviewUserFromRegister', () => {
    it('maps form fields, empty friends, stable id, and omits password', () => {
      const user = buildLocalPreviewUserFromRegister({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'Ada.Lovelace@Example.COM',
        password: 'secret',
        location: 'London',
        occupation: 'Mathematician',
      });

      expect(user).toMatchObject({
        _id: 'local-ada-lovelace-example-com',
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'Ada.Lovelace@Example.COM',
        location: 'London',
        occupation: 'Mathematician',
        friends: [],
        role: ['user'],
        viewedProfile: 0,
        impressions: 0,
        picturePath: '',
      });
      expect(user).not.toHaveProperty('password');
      expect(user.profileImage).toEqual({
        _id: 'local-preview',
        url: '',
        deleted: false,
        createdAt: new Date(0),
        updatedAt: new Date(0),
      });
    });

    it('empty email slug becomes local-user', () => {
      const user = buildLocalPreviewUserFromRegister({
        firstName: 'X',
        lastName: 'Y',
        email: '@@@',
        password: 'secret',
        location: '',
        occupation: '',
      });

      expect(user._id).toBe('local-user');
    });
  });

  describe('buildLocalPreviewUserFromLogin', () => {
    it('uses email local-part as firstName and empty lastName', () => {
      const user = buildLocalPreviewUserFromLogin({
        email: 'ada.lovelace@example.com',
        password: 'secret',
      });

      expect(user).toMatchObject({
        _id: 'local-ada-lovelace-example-com',
        firstName: 'ada.lovelace',
        lastName: '',
        email: 'ada.lovelace@example.com',
        location: '',
        occupation: '',
        friends: [],
      });
      expect(user).not.toHaveProperty('password');
    });
  });

  describe('localStorage round-trip', () => {
    it('save, read, and clear', () => {
      const user = buildLocalPreviewUserFromLogin({
        email: 'preview@example.com',
        password: 'ignored',
      });

      saveLocalPreviewUser(user);

      expect(localStorage.getItem(LOCAL_PREVIEW_STORAGE_KEY)).toBeTruthy();
      expect(readLocalPreviewUser()).toEqual(user);

      clearLocalPreviewUser();

      expect(localStorage.getItem(LOCAL_PREVIEW_STORAGE_KEY)).toBeNull();
      expect(readLocalPreviewUser()).toBeUndefined();
    });
  });

  describe('LOCAL_PREVIEW_TOKEN', () => {
    it('is the fixed preview token string', () => {
      expect(LOCAL_PREVIEW_TOKEN).toBe('local-preview');
    });
  });

  describe('createLocalPreviewSessionFromLogin', () => {
    it('saves user and returns token plus userFound', () => {
      const session = createLocalPreviewSessionFromLogin({
        email: 'ada.lovelace@example.com',
        password: 'secret',
      });

      expect(session.token).toBe(LOCAL_PREVIEW_TOKEN);
      expect(session.userFound).toMatchObject({
        _id: 'local-ada-lovelace-example-com',
        firstName: 'ada.lovelace',
        lastName: '',
        email: 'ada.lovelace@example.com',
      });
      expect(readLocalPreviewUser()).toEqual(session.userFound);
    });
  });

  describe('createLocalPreviewSessionFromRegister', () => {
    it('saves user and returns token plus userFound', () => {
      const session = createLocalPreviewSessionFromRegister({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'Ada.Lovelace@Example.COM',
        password: 'secret',
        location: 'London',
        occupation: 'Mathematician',
      });

      expect(session.token).toBe(LOCAL_PREVIEW_TOKEN);
      expect(session.userFound).toMatchObject({
        _id: 'local-ada-lovelace-example-com',
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'Ada.Lovelace@Example.COM',
        location: 'London',
        occupation: 'Mathematician',
      });
      expect(readLocalPreviewUser()).toEqual(session.userFound);
    });
  });

  describe('resolvePreviewUserOrThrow', () => {
    it('returns preview user when id matches', async () => {
      const user = buildLocalPreviewUserFromLogin({
        email: 'match@example.com',
        password: 'x',
      });
      saveLocalPreviewUser(user);

      await expect(resolvePreviewUserOrThrow(user._id)).resolves.toEqual(user);
    });

    it('throws when id mismatches or storage empty', async () => {
      await expect(resolvePreviewUserOrThrow('other-id')).rejects.toThrow(
        'Local preview user not found',
      );

      const user = buildLocalPreviewUserFromLogin({
        email: 'stored@example.com',
        password: 'x',
      });
      saveLocalPreviewUser(user);

      await expect(resolvePreviewUserOrThrow('other-id')).rejects.toThrow(
        'Local preview user not found',
      );
    });
  });
});

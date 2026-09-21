import { authEmptyState, userEmptyState } from '@/models';
import { describe, expect, it } from 'vitest';
import authReducer, { makeLogin, makeLogout } from './authSlice';

// Captured on: 2026-09-20 from feat/client-unit-tests
// Known bugs: none recorded

// characterization: documents current behavior, NOT intended spec
describe('authSlice characterization', () => {
  it('makeLogin with user and token — stores user and token on state', () => {
    // Arrange
    const previous = { ...authEmptyState };
    const payload = {
      user: { id: 'u1', name: 'Ada', email: 'ada@example.com', password: '' },
      token: 'jwt-token',
    };

    // Act
    const next = authReducer(previous, makeLogin(payload));

    // Assert
    expect(next.user).toEqual(payload.user);
    expect(next.token).toBe('jwt-token');
  });

  it('makeLogout after login — clears user to empty and token to empty string', () => {
    // Arrange
    const previous = {
      user: { id: 'u1', name: 'Ada', email: 'ada@example.com', password: '' },
      token: 'jwt-token',
    };

    // Act
    const next = authReducer(previous, makeLogout({}));

    // Assert
    expect(next.user).toEqual(userEmptyState);
    expect(next.token).toBe('');
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Captured on: 2026-09-20 from feat/client-unit-tests
// Known bugs: none recorded
// Companion examples for auth.schema.property.spec.ts (local-mode login/register bounds)

// characterization: documents current behavior, NOT intended spec
describe('auth schemas characterization (local mode — Cognito off)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock('@/shared/lib/utilities/cognitoMode', () => ({
      isCognitoClientEnabled: () => false,
    }));
  });

  afterEach(() => {
    vi.doUnmock('@/shared/lib/utilities/cognitoMode');
    vi.resetModules();
  });

  it('valid login payload — isValid returns true', async () => {
    // Arrange
    const { loginSchema } = await import('./auth.schema');
    const payload = { email: 'user@example.com', password: 'abc' };

    // Act
    const result = await loginSchema.isValid(payload);

    // Assert
    expect(result).toBe(true);
  });

  it('valid register payload — isValid returns true', async () => {
    // Arrange
    const { registerSchema } = await import('./auth.schema');
    const payload = {
      email: 'user@example.com',
      password: 'abcde',
      firstName: 'Alice',
      lastName: 'Smith',
      location: 'NYC',
      occupation: 'Eng',
      myFile: 'avatar.png',
    };

    // Act
    const result = await registerSchema.isValid(payload);

    // Assert
    expect(result).toBe(true);
  });

  it('invalid email on login — isValid returns false', async () => {
    // Arrange
    const { loginSchema } = await import('./auth.schema');
    const payload = { email: 'not-an-email', password: 'abc' };

    // Act
    const result = await loginSchema.isValid(payload);

    // Assert
    expect(result).toBe(false);
  });

  it('register password shorter than local min — isValid returns false', async () => {
    // Arrange
    const { registerSchema } = await import('./auth.schema');
    const payload = {
      email: 'user@example.com',
      password: 'abcd',
      firstName: 'Alice',
      lastName: 'Smith',
      location: 'NYC',
      occupation: 'Eng',
      myFile: 'avatar.png',
    };

    // Act
    const result = await registerSchema.isValid(payload);

    // Assert
    expect(result).toBe(false);
  });
});

// characterization: documents current behavior, NOT intended spec
describe('auth schemas characterization (Cognito on)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock('@/shared/lib/utilities/cognitoMode', () => ({
      isCognitoClientEnabled: () => true,
    }));
  });

  afterEach(() => {
    vi.doUnmock('@/shared/lib/utilities/cognitoMode');
    vi.resetModules();
  });

  it('weak password failing Cognito policy — isValid returns false', async () => {
    // Arrange
    const { loginSchema } = await import('./auth.schema');
    const payload = { email: 'user@example.com', password: 'short' };

    // Act
    const result = await loginSchema.isValid(payload);

    // Assert
    expect(result).toBe(false);
  });

  it('password meeting Cognito policy — isValid returns true', async () => {
    // Arrange
    const { loginSchema } = await import('./auth.schema');
    const payload = { email: 'user@example.com', password: 'Password1' };

    // Act
    const result = await loginSchema.isValid(payload);

    // Assert
    expect(result).toBe(true);
  });
});

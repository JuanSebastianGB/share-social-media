import { afterEach, describe, expect, it, vi } from 'vitest';
import { getCognitoClientConfig, isCognitoClientEnabled } from './cognitoMode';

// Captured on: 2026-09-20 from feat/client-unit-tests
// Known bugs: none recorded

// characterization: documents current behavior, NOT intended spec
describe('cognitoMode characterization', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  // characterization: documents current behavior, NOT intended spec
  describe('isCognitoClientEnabled', () => {
    it('all three Cognito env vars set — returns true', () => {
      // Arrange
      vi.stubEnv('VITE_COGNITO_USER_POOL_ID', 'us-east-1_pool');
      vi.stubEnv('VITE_COGNITO_CLIENT_ID', 'client123');
      vi.stubEnv('VITE_AWS_REGION', 'us-east-1');

      // Act
      const enabled = isCognitoClientEnabled();

      // Assert
      expect(enabled).toBe(true);
    });

    it('any Cognito env var missing — returns false', () => {
      // Arrange
      vi.stubEnv('VITE_COGNITO_USER_POOL_ID', 'us-east-1_pool');
      vi.stubEnv('VITE_COGNITO_CLIENT_ID', '');
      vi.stubEnv('VITE_AWS_REGION', 'us-east-1');

      // Act
      const enabled = isCognitoClientEnabled();

      // Assert
      expect(enabled).toBe(false);
    });
  });

  // characterization: documents current behavior, NOT intended spec
  describe('getCognitoClientConfig', () => {
    it('Cognito disabled — throws not-configured error', () => {
      // Arrange
      vi.stubEnv('VITE_COGNITO_USER_POOL_ID', '');
      vi.stubEnv('VITE_COGNITO_CLIENT_ID', '');
      vi.stubEnv('VITE_AWS_REGION', '');

      // Act / Assert
      expect(() => getCognitoClientConfig()).toThrow(
        'Cognito client env is not configured',
      );
    });

    it('Cognito enabled — returns pool, client, and region', () => {
      // Arrange
      vi.stubEnv('VITE_COGNITO_USER_POOL_ID', 'us-east-1_pool');
      vi.stubEnv('VITE_COGNITO_CLIENT_ID', 'client123');
      vi.stubEnv('VITE_AWS_REGION', 'us-east-1');

      // Act
      const config = getCognitoClientConfig();

      // Assert
      expect(config).toEqual({
        userPoolId: 'us-east-1_pool',
        clientId: 'client123',
        region: 'us-east-1',
      });
    });
  });
});

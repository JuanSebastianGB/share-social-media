/**
 * Client Cognito mode when Vite env has pool + client + region.
 * Absent → local HS256 demo via /auth/register and /auth/login.
 */
export function isCognitoClientEnabled(): boolean {
  const poolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
  const region = import.meta.env.VITE_AWS_REGION;
  return Boolean(poolId && clientId && region);
}

export function getCognitoClientConfig() {
  if (!isCognitoClientEnabled()) {
    throw new Error('Cognito client env is not configured');
  }
  return {
    userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID as string,
    clientId: import.meta.env.VITE_COGNITO_CLIENT_ID as string,
    region: import.meta.env.VITE_AWS_REGION as string,
  };
}

/**
 * Cognito JWT verification is enabled only when both pool and client IDs are set.
 * Local Jest / memory mode leaves them unset and keeps HS256 JWT_SECRET auth.
 */
export function isCognitoAuthEnabled(): boolean {
  const poolId = process.env.COGNITO_USER_POOL_ID?.trim();
  const clientId = process.env.COGNITO_CLIENT_ID?.trim();
  return Boolean(poolId && clientId);
}

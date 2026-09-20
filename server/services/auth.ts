import { createUser, getUserByCognitoSub } from '../repositories/users.js';
import { generateToken } from '../utilities/handleJwt.js';

/**
 * Creates a new user and returns the user object (without password) and a token.
 * HS256 / local mode only.
 */
const registerService = async (dataToStore: Record<string, unknown>) => {
  const response = await createUser(dataToStore);
  const { password: _pw, ...safe } = response;
  const { _id, role } = safe;
  return {
    response: safe,
    token: generateToken({
      _id: String(_id),
      role: role as string | string[],
    }),
  };
};

/**
 * Cognito mode: create DynamoDB profile linked to cognitoSub (no password / no app JWT).
 * Idempotent when the sub already has a profile.
 */
const completeProfileService = async (
  cognitoSub: string,
  dataToStore: Record<string, unknown>,
) => {
  const existing = await getUserByCognitoSub(cognitoSub);
  if (existing) {
    const { password: _pw, ...safe } = existing;
    return { response: safe, created: false };
  }

  const response = await createUser({
    ...dataToStore,
    cognitoSub,
  });
  const { password: _pw, ...safe } = response;
  return { response: safe, created: true };
};

export { registerService, completeProfileService };

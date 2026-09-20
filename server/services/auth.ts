import { createUser } from '../repositories/users.js';
import { generateToken } from '../utilities/handleJwt.js';

/**
 * Creates a new user and returns the user object (without password) and a token.
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

export { registerService };

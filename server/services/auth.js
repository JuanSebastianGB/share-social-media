import User from '../models/user.js';
import { generateToken } from '../utilities/handleJwt.js';

/**
 * It takes in a data object, creates a new user with that data, and returns the new user object and a
 * token.
 * @param dataToStore - {
 * @returns The response is an object with the following properties:
 * response: {
 *   _id: 5e8f8f8f8f8f8f8f8f8f8f8f,
 *   role: 'user',
 *   password: undefined
 * }
 * token: 'eyJhbGciOiJIUzI1NiIsInR5
 */
const registerService = async (dataToStore) => {
  const response = await User.create(dataToStore);
  response.set('password', undefined, { strict: false });
  const { _id, role } = response;
  return { response, token: generateToken({ _id, role }) };
};

export { registerService };

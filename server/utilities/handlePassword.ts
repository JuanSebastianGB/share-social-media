import bcrypt from 'bcryptjs';

/**
 * It takes a password, encrypts it, and returns the encrypted password
 */
const encrypt = async (password: string) => await bcrypt.hash(password, 10);

/**
 * It compares the password with the hashed password.
 */
const compare = async (password: string, hashedPassword: string) =>
  await bcrypt.compare(password, hashedPassword);

export { encrypt, compare };

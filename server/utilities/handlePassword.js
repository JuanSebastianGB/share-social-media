import bcrypt from 'bcryptjs';

/**
 * It takes a password, encrypts it, and returns the encrypted password
 * @param password - The password to be encrypted.
 */
const encrypt = async (password) => await bcrypt.hash(password, 10);
/**
 * It compares the password with the hashed password.
 * @param password - The password to compare.
 * @param hashedPassword - The hashed password that was stored in the database.
 */
const compare = async (password, hashedPassword) =>
  await bcrypt.compare(password, hashedPassword);

export { encrypt, compare };

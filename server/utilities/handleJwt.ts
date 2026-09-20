import jwt from 'jsonwebtoken';
import type { JwtUserData } from '../types/auth.js';

/**
 * It takes an object with an _id and a role property, and returns a JWT token that expires in 2 hours.
 */
const generateToken = ({ _id, role }: JwtUserData) =>
  jwt.sign({ _id, role }, process.env.JWT_SECRET as string, {
    expiresIn: '2h',
  });

/**
 * If the token is valid, return the decoded token, otherwise return null.
 */
const verifyToken = (token: string): JwtUserData | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET as string) as JwtUserData;
  } catch {
    return null;
  }
};

export { generateToken, verifyToken };

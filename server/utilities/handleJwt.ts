import { CognitoJwtVerifier } from 'aws-jwt-verify';
import jwt from 'jsonwebtoken';
import type { JwtUserData } from '../types/auth.js';
import { isCognitoAuthEnabled } from './cognitoMode.js';

type CognitoAccessVerifier = ReturnType<typeof CognitoJwtVerifier.create>;

let cognitoVerifier: CognitoAccessVerifier | undefined;

function getCognitoVerifier(): CognitoAccessVerifier {
  if (!cognitoVerifier) {
    cognitoVerifier = CognitoJwtVerifier.create({
      userPoolId: process.env.COGNITO_USER_POOL_ID as string,
      tokenUse: 'access',
      clientId: process.env.COGNITO_CLIENT_ID as string,
    });
  }
  return cognitoVerifier;
}

/** Reset lazy Cognito verifier (tests that toggle env). */
export function resetCognitoVerifierForTests(): void {
  cognitoVerifier = undefined;
}

/**
 * It takes an object with an _id and a role property, and returns a JWT token that expires in 2 hours.
 * HS256 / local mode only — Cognito issues its own tokens.
 */
const generateToken = ({ _id, role }: JwtUserData) =>
  jwt.sign({ _id, role }, process.env.JWT_SECRET as string, {
    expiresIn: '2h',
  });

/**
 * Verify Bearer token: Cognito access JWT when COGNITO_* are set, else HS256 JWT_SECRET.
 * Cognito path returns cognitoSub with empty `_id` — session middleware resolves the app user.
 */
const verifyToken = async (token: string): Promise<JwtUserData | null> => {
  if (isCognitoAuthEnabled()) {
    try {
      const payload = await getCognitoVerifier().verify(token);
      return {
        _id: '',
        role: 'user',
        cognitoSub: payload.sub,
      };
    } catch {
      return null;
    }
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET as string) as JwtUserData;
  } catch {
    return null;
  }
};

export { generateToken, verifyToken };

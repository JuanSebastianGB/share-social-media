import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  SignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { getCognitoClientConfig } from '@/shared/lib/utilities/cognitoMode';

function getClient() {
  const { region } = getCognitoClientConfig();
  return new CognitoIdentityProviderClient({ region });
}

/**
 * Sign up with email as username (pool uses email alias).
 * Returns whether Cognito already confirmed the user.
 */
export async function cognitoSignUp(
  email: string,
  password: string,
): Promise<{ userConfirmed: boolean }> {
  const { clientId } = getCognitoClientConfig();
  const result = await getClient().send(
    new SignUpCommand({
      ClientId: clientId,
      Username: email,
      Password: password,
      UserAttributes: [{ Name: 'email', Value: email }],
    }),
  );
  return { userConfirmed: Boolean(result.UserConfirmed) };
}

export async function cognitoConfirmSignUp(
  email: string,
  confirmationCode: string,
): Promise<void> {
  const { clientId } = getCognitoClientConfig();
  await getClient().send(
    new ConfirmSignUpCommand({
      ClientId: clientId,
      Username: email,
      ConfirmationCode: confirmationCode,
    }),
  );
}

/** USER_PASSWORD_AUTH → Cognito access token (Bearer for API). */
export async function cognitoSignIn(
  email: string,
  password: string,
): Promise<string> {
  const { clientId } = getCognitoClientConfig();
  const result = await getClient().send(
    new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: clientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    }),
  );
  const accessToken = result.AuthenticationResult?.AccessToken;
  if (!accessToken) {
    throw new Error('Cognito sign-in did not return an access token');
  }
  return accessToken;
}

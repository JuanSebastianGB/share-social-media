import { urlServices } from '@/constants';
import { Api } from '@/interceptors';
import { LoginModel, RegisterModel, UserApiModel } from '@/models';
import { isCognitoClientEnabled } from '@/utilities/cognitoMode';
import {
  cognitoConfirmSignUp,
  cognitoSignIn,
  cognitoSignUp,
} from './cognito.service';

export type AuthSessionPayload = {
  token: string;
  userFound: Record<string, unknown> | UserApiModel;
};

/** Local HS256 login — unchanged contract. */
export const loginService = async (body: LoginModel, options = {}) =>
  await Api.post(urlServices.LOGIN_URL, body, options);

/** Local HS256 register — unchanged contract. */
export const registerService = async (body: FormData, options = {}) => {
  const response = await Api.post(urlServices.REGISTER_URL, body, options);
  return response;
};

/**
 * Cognito mode: complete DynamoDB profile (multipart, no password).
 * Pass accessToken explicitly — Redux may not hold it yet.
 */
export const completeProfileService = async (
  form: FormData,
  accessToken: string,
  options: Record<string, unknown> = {},
) => {
  const response = await Api.post(urlServices.PROFILE_URL, form, {
    ...options,
    headers: {
      ...(options.headers as Record<string, string> | undefined),
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response;
};

/**
 * Fetch existing app profile after Cognito sign-in.
 * Server short-circuits when the Cognito sub already has a DynamoDB user.
 */
export const fetchAuthProfileService = async (
  accessToken: string,
  options: Record<string, unknown> = {},
) => {
  const response = await Api.post(
    urlServices.PROFILE_URL,
    new FormData(),
    {
      ...options,
      headers: {
        ...(options.headers as Record<string, string> | undefined),
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  return response;
};

function buildProfileForm(values: RegisterModel): FormData {
  const form = new FormData();
  // Dropzone stores a File on myFile at runtime (typed loosely as Picture).
  const file = values.myFile as unknown as File | undefined;
  if (file) form.append('myFile', file);
  form.append('firstName', values.firstName);
  form.append('lastName', values.lastName);
  form.append('email', values.email);
  form.append('location', values.location);
  form.append('occupation', values.occupation);
  form.append('picturePath', file?.name ?? '');
  return form;
}

/**
 * Cognito register: SignUp → ConfirmSignUp (if needed) → InitiateAuth → POST /auth/profile.
 */
export type CognitoRegisterOptions = Record<string, unknown> & {
  confirmSignUpCode?: (email: string) => Promise<string>;
};

export async function registerWithCognito(
  values: RegisterModel,
  options: CognitoRegisterOptions = {},
): Promise<AuthSessionPayload> {
  const { userConfirmed } = await cognitoSignUp(values.email, values.password);
  if (!userConfirmed) {
    const getCode = options.confirmSignUpCode;
    if (!getCode) {
      throw new Error('Email confirmation code handler is required');
    }
    const code = await getCode(values.email);
    if (!code?.trim()) {
      throw new Error('Email confirmation code is required');
    }
    await cognitoConfirmSignUp(values.email, code.trim());
  }

  const accessToken = await cognitoSignIn(values.email, values.password);
  const { data } = await completeProfileService(
    buildProfileForm(values),
    accessToken,
    options,
  );
  return {
    token: accessToken,
    userFound: data.response,
  };
}

/** Cognito login: InitiateAuth → profile (existing user). */
export async function loginWithCognito(
  values: LoginModel,
  options: Record<string, unknown> = {},
): Promise<AuthSessionPayload> {
  const accessToken = await cognitoSignIn(values.email, values.password);
  const { data } = await fetchAuthProfileService(accessToken, options);
  return {
    token: accessToken,
    userFound: data.response,
  };
}

export { isCognitoClientEnabled };

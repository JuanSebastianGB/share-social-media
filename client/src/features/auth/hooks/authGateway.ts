import { LoginModel, RegisterModel } from '@/models';
import { createDefault } from '@/services/files.service';
import {
  createLocalPreviewSessionFromLogin,
  createLocalPreviewSessionFromRegister,
  isLocalPreviewEnabled,
} from '@/utilities';
import { isCognitoClientEnabled } from '@/utilities/cognitoMode';
import {
  AuthSessionPayload,
  loginService,
  loginWithCognito,
  registerService,
  registerWithCognito,
} from '../api/auth.service';

export type AuthSessionWire = AuthSessionPayload;

export async function signIn(
  values: LoginModel,
  options: { signal?: AbortSignal } = {},
): Promise<AuthSessionWire> {
  if (isLocalPreviewEnabled()) {
    return createLocalPreviewSessionFromLogin(values);
  }
  if (isCognitoClientEnabled()) {
    return loginWithCognito(values, options);
  }
  const { data } = await loginService(values, options);
  return data as AuthSessionWire;
}

export type SignUpResult =
  | { kind: 'session'; session: AuthSessionWire }
  | { kind: 'registered' };

export type SignUpOptions = {
  signal?: AbortSignal;
  confirmSignUpCode?: (email: string) => Promise<string>;
};

export async function signUp(
  values: RegisterModel,
  options: SignUpOptions = {},
): Promise<SignUpResult> {
  if (isLocalPreviewEnabled()) {
    return {
      kind: 'session',
      session: createLocalPreviewSessionFromRegister(values),
    };
  }

  await createDefault();

  if (isCognitoClientEnabled()) {
    const session = await registerWithCognito(values, options);
    return { kind: 'session', session };
  }

  const form = new FormData();
  const file = values.myFile as unknown as File | undefined;
  if (file) form.append('myFile', file);
  form.append('firstName', values.firstName);
  form.append('lastName', values.lastName);
  form.append('email', values.email);
  form.append('password', values.password);
  form.append('location', values.location);
  form.append('occupation', values.occupation);
  form.append('picturePath', file?.name ?? '');

  await registerService(form, options);
  return { kind: 'registered' };
}

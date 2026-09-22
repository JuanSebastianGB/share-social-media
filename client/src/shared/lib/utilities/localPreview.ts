import { LoginModel, RegisterModel, UserApiModel } from '@/models';

export const LOCAL_PREVIEW_STORAGE_KEY =
  'share-social-media.local-preview-user';
export const LOCAL_PREVIEW_TOKEN = 'local-preview';

const EPOCH = new Date(0);

export function isLocalPreviewEnabled(
  env: { DEV?: boolean; VITE_LOCAL_PREVIEW?: string } = import.meta.env,
): boolean {
  return env.DEV === true && env.VITE_LOCAL_PREVIEW === 'true';
}

function previewUserIdFromEmail(email: string): string {
  const slug = email
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug ? `local-${slug}` : 'local-user';
}

function previewProfileImageStub() {
  return {
    _id: 'local-preview',
    url: '',
    deleted: false,
    createdAt: EPOCH,
    updatedAt: EPOCH,
  };
}

function basePreviewUser(partial: {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  location: string;
  occupation: string;
}): UserApiModel {
  return {
    _id: partial._id,
    firstName: partial.firstName,
    lastName: partial.lastName,
    email: partial.email,
    location: partial.location,
    occupation: partial.occupation,
    friends: [],
    role: ['user'],
    viewedProfile: 0,
    impressions: 0,
    picturePath: '',
    profileImage: previewProfileImageStub(),
  };
}

export function buildLocalPreviewUserFromRegister(
  values: RegisterModel,
): UserApiModel {
  return basePreviewUser({
    _id: previewUserIdFromEmail(values.email),
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email,
    location: values.location,
    occupation: values.occupation,
  });
}

export function buildLocalPreviewUserFromLogin(
  values: LoginModel,
): UserApiModel {
  const localPart = values.email.split('@')[0] ?? '';
  return basePreviewUser({
    _id: previewUserIdFromEmail(values.email),
    firstName: localPart,
    lastName: '',
    email: values.email,
    location: '',
    occupation: '',
  });
}

export function saveLocalPreviewUser(user: UserApiModel): void {
  localStorage.setItem(LOCAL_PREVIEW_STORAGE_KEY, JSON.stringify(user));
}

export function readLocalPreviewUser(): UserApiModel | undefined {
  const raw = localStorage.getItem(LOCAL_PREVIEW_STORAGE_KEY);
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as UserApiModel;
    if (parsed.profileImage) {
      parsed.profileImage = {
        ...parsed.profileImage,
        createdAt: new Date(parsed.profileImage.createdAt),
        updatedAt: new Date(parsed.profileImage.updatedAt),
      };
    }
    return parsed;
  } catch {
    return undefined;
  }
}

export function clearLocalPreviewUser(): void {
  localStorage.removeItem(LOCAL_PREVIEW_STORAGE_KEY);
}

export function createLocalPreviewSessionFromLogin(values: LoginModel): {
  token: string;
  userFound: UserApiModel;
} {
  const userFound = buildLocalPreviewUserFromLogin(values);
  saveLocalPreviewUser(userFound);
  return { token: LOCAL_PREVIEW_TOKEN, userFound };
}

export function createLocalPreviewSessionFromRegister(values: RegisterModel): {
  token: string;
  userFound: UserApiModel;
} {
  const userFound = buildLocalPreviewUserFromRegister(values);
  saveLocalPreviewUser(userFound);
  return { token: LOCAL_PREVIEW_TOKEN, userFound };
}

export async function resolvePreviewUserOrThrow(
  id: string,
): Promise<UserApiModel> {
  const preview = readLocalPreviewUser();
  if (preview?._id === id) return preview;
  throw new Error('Local preview user not found');
}

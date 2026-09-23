/**
 * Form-shape user used by `authSlice` and friends-empty fallback. Distinct
 * from `UserApiModel` (the server-returned shape) — see `UserApiModel`.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

export const userEmptyState: User = {
  id: '',
  name: '',
  email: '',
  password: '',
};

export interface ProfileImage {
  _id: string;
  url: string;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Server-returned user shape. Mirrored from
 * `server/modules/identity/application/composition.ts:toLegacyUserRecord` and
 * `getUserService` / `getUsersService` (the assembler fields).
 */
export interface UserApiModel {
  _id: string;
  firstName: string;
  lastName: string;
  role: string[];
  friends: string[];
  viewedProfile: number;
  impressions: number;
  profileImage: ProfileImage;
  email: string;
  location: string;
  occupation: string;
  picturePath: string;
}
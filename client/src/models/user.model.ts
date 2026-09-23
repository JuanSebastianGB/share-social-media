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

/**
 * Empty placeholder used by the auth slice as initial / post-logout state.
 * Has the same shape as `UserApiModel` so consumers can read fields without
 * runtime narrowing (e.g. `auth.user._id`).
 */
export const emptyUserApiModel: UserApiModel = {
  _id: '',
  firstName: '',
  lastName: '',
  role: [],
  friends: [],
  viewedProfile: 0,
  impressions: 0,
  profileImage: {
    _id: '',
    url: '',
    deleted: false,
    createdAt: new Date(0),
    updatedAt: new Date(0),
  },
  email: '',
  location: '',
  occupation: '',
  picturePath: '',
};
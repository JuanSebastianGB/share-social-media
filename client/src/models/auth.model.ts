import { emptyUserApiModel, type UserApiModel } from './user.model';

export interface Auth {
  /**
   * The authenticated user in server shape. After login this carries the
   * real UserApiModel; after logout it carries `emptyUserApiModel`. Use
   * `auth.user._id` (never `auth.user.id` — that field does not exist).
   */
  user: UserApiModel;
  token: string;
}

export const authEmptyState: Auth = {
  user: emptyUserApiModel,
  token: '',
};

export interface LoginModel {
  email: string;
  password: string;
}

export const loginInitialValues: LoginModel = {
  email: '',
  password: '',
};

interface Picture {
  name: string;
}

const PictureEmptyState = {
  name: '',
};

export interface RegisterModel extends LoginModel {
  firstName: string;
  lastName: string;
  location: string;
  occupation: string;
  picturePath?: string;
  myFile?: Picture;
}

export const RegisterInitialValues: RegisterModel = {
  firstName: '',
  lastName: '',
  occupation: '',
  location: '',
  picturePath: '',
  myFile: PictureEmptyState,
  email: '',
  password: '',
};
import { PaletteMode } from '@mui/material';
import { Post } from './post.model';
import { User, userEmptyState } from './user.model';

export interface Auth {
  user: User;
  token: string;
  mode: PaletteMode | undefined;
  posts: Post[];
  friends: User[];
}

export const authEmptyState: Auth = {
  user: userEmptyState,
  token: '',
  mode: 'light',
  posts: [],
  friends: [],
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
  location: '',
  occupation: '',
  picturePath: '',
  myFile: PictureEmptyState,
  email: '',
  password: '',
};

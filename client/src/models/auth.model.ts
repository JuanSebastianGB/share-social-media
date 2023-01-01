import { Post } from './post.model';
import { User, userEmptyState } from './user.model';

export interface Auth {
  user: User;
  token: string;
  mode: string;
  posts: Post[];
}

export const authEmptyState: Auth = {
  user: userEmptyState,
  token: '',
  mode: '',
  posts: [],
};

export interface LoginModel {
  email: string;
  password: string;
}

export const loginInitialValues: LoginModel = {
  email: '',
  password: '',
};

export interface RegisterModel extends LoginModel {
  firstName: string;
  lastName: string;
  location: string;
  occupation: string;
  picture: string;
}

export const RegisterInitialValues: RegisterModel = {
  firstName: '',
  lastName: '',
  location: '',
  occupation: '',
  picture: '',
  email: '',
  password: '',
};

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
}

export interface userModel {
  id: string;
  name: string;
  email: string;
  role: string[];
  friends: string[];
  viewedProfile: number;
  location: string;
  occupation: string;
}

export const userInitialState = {
  id: '',
  name: '',
  email: '',
  role: [],
  friends: [],
  viewedProfile: 0,
  location: '',
  occupation: '',
};

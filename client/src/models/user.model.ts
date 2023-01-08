export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

export const userEmptyState: User = {
  id: 0,
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
}

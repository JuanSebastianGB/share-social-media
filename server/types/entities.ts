export type UserRecord = {
  _id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  password?: string;
  email: string;
  age?: number;
  role: string | string[];
  friends: string[];
  location?: string;
  occupation?: string;
  viewedProfile?: number;
  impressions?: number;
  profileImageId?: string;
  /** Cognito access-token `sub` when identity is managed by Cognito. */
  cognitoSub?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type StorageRecord = {
  _id: string;
  fileName?: string;
  filename?: string;
  url?: string;
  /** FILE author, same attribute name as post and comment authors. */
  userId?: string;
  deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type PostRecord = {
  _id: string;
  body: string;
  userId: string;
  fileId?: string;
  likes: Record<string, boolean>;
  comments: string[];
  type?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CommentRecord = {
  _id: string;
  description: string;
  userId: string;
  firstName: string;
  lastName: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ItemRecord = {
  _id: string;
  name: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type DeleteResult = {
  acknowledged: true;
  deletedCount: number;
};

export type UpdateResult = {
  acknowledged: true;
  matchedCount: number;
  modifiedCount: number;
};

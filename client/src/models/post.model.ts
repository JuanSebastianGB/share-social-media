import { File } from './file.model';
import { UserApiModel } from './user.model';

export interface Post {
  _id: string;
  body: string;
  userId: string;
  fileId: string;
  likes: Map<string, boolean>;
  comments: string[];
}

export interface Likes {}

export interface PostApiModel {
  _id: string;
  body: string;
  likes: Likes;
  comments: any[];
  file: File;
  user: UserApiModel;
  type: string;
}

export interface PostModel {
  id: string;
  body: string;
  likes: Likes;
  comments: any[];
  file: File;
  user: UserApiModel;
  type: string;
}

export interface PostFormInterface {
  userId: string;
  body: string;
  myFile: File;
}

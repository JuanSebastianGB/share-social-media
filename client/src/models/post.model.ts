import { UserApiModel } from './user.model';

/**
 * Server returns `Post.likes` as a map of userId → true. Mirrored from
 * `server/modules/feed/domain/post.ts`.
 */
export type Likes = Record<string, boolean>;

/**
 * Hydrated post shape returned by `GET /posts` and friends. Mirrored from
 * `server/modules/feed/application/composition.ts:toLegacyPostRecord` and the
 * assembler that hydrates `user` and `file`.
 */
export interface PostApiModel {
  _id: string;
  body: string;
  likes: Likes;
  comments: string[];
  file: { _id: string; url: string };
  user: UserApiModel;
  type: string;
}
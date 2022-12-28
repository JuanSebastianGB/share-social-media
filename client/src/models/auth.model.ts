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

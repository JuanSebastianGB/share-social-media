import { Auth } from './auth.model';
import { FriendsState } from './friends.model';
import { PostsState } from './posts.model';
import { ThemeState } from './theme.model';

export interface AppStore {
  auth: Auth;
  posts: PostsState;
  friends: FriendsState;
  theme: ThemeState;
}
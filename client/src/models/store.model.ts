import { Auth } from './auth.model';
import { FriendsState } from './friends.model';
import { PostsState } from './posts.model';
import { ThemeState } from './theme.model';
import { User } from './user.model';

export interface AppStore {
  user: User;
  auth: Auth;
  posts: PostsState;
  friends: FriendsState;
  theme: ThemeState;
}

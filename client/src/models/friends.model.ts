import { UserApiModel } from './user.model';

export interface FriendsState {
  friends: UserApiModel[];
}

export const friendsEmptyState: FriendsState = {
  friends: [],
};

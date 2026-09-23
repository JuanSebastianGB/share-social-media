import type { UserApiModel } from '@/models';
import { useFetchedResource } from '@/shared/hooks/useFetchedResource';
import { setFriends } from '@/redux/states/friendsSlice';
import { fetchFriendsService } from '../api/friends.service';
import { useDispatch } from 'react-redux';

/**
 * It fetches the friends of the user from the server and returns the data.
 * @returns The data object is being returned.
 */
export const useFriends = (id: string) => {
  const dispatch = useDispatch();
  const { data, error, isError, isLoading } = useFetchedResource<UserApiModel[]>({
    fetcher: () => fetchFriendsService(id, {}),
    deps: [id],
    onSuccess: (friends) => dispatch(setFriends({ friends })),
  });
  return { error, isError, isLoading, friends: data };
};
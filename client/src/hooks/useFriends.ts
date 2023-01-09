import { AppStore } from '@/models';
import { fetchFriendsService } from '@/services';
import { useSelector } from 'react-redux';
import useSWR from 'swr';

/**
 * It fetches the friends of the user from the server and returns the data.
 * @returns The data object is being returned.
 */
export const useFriends = () => {
  const { token } = useSelector((store: AppStore) => store.auth);
  const { id } = useSelector((store: AppStore) => store.auth.user);
  const fetcher = async () => await fetchFriendsService(id, token);
  const data = useSWR(`${id}/friends`, fetcher);
  return data;
};

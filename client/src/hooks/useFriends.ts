import { setFriends } from '@/redux/states/authSlice';
import { fetchFriendsService } from '@/services';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

/**
 * It fetches the friends of the user from the server and returns the data.
 * @returns The data object is being returned.
 */
export const useFriends = (id: string) => {
  const dispatch = useDispatch();
  const getFriends = async () => {
    const response = await fetchFriendsService(id);
    dispatch(setFriends({ friends: response }));
  };

  useEffect(() => {
    try {
      getFriends();
    } catch (error) {
      console.log({ error });
    }
  }, [id]);
};

import { AppStore } from '@/models';
import { setFriends } from '@/redux/states/authSlice';
import { fetchFriendsService } from '@/services';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * It fetches the friends of the user from the server and returns the data.
 * @returns The data object is being returned.
 */
export const useFriends = (id: string) => {
  const [error, setError] = useState({});
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { friends } = useSelector((store: AppStore) => store.auth);

  const dispatch = useDispatch();

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    fetchFriendsService(id, {})
      .then((response) => {
        setError({});
        setIsError(false);
        setIsLoading(true);
        dispatch(setFriends({ friends: response }));
        setIsLoading(false);
      })
      .catch((error) => {
        console.log({ error });
        setIsLoading(false);
        if (signal.aborted) return;
        setError({ error });
        setIsError(true);
      });

    return () => controller.abort();
  }, [id]);

  return { error, isError, isLoading, friends };
};

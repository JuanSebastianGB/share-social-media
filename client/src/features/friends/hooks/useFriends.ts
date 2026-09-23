import type { AppStore } from '@/models';
import { toHookErrorState, type HookErrorState } from '@/shared/lib/types/hook-error';
import { setFriends } from '@/redux/states/friendsSlice';
import { fetchFriendsService } from '../api/friends.service';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * It fetches the friends of the user from the server and returns the data.
 * @returns The data object is being returned.
 */
export const useFriends = (id: string) => {
  const [error, setError] = useState<HookErrorState | null>(null);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { friends } = useSelector((store: AppStore) => store.friends);

  const dispatch = useDispatch();

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    fetchFriendsService(id, {})
      .then((response) => {
        setError(null);
        setIsError(false);
        setIsLoading(true);
        dispatch(setFriends({ friends: response }));
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
        if (signal.aborted) return;
        setError(toHookErrorState(err));
        setIsError(true);
      });

    return () => controller.abort();
  }, [id]);

  return { error, isError, isLoading, friends };
};
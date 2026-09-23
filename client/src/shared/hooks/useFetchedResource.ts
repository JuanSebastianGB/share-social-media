import { useEffect, useState } from 'react';
import { toHookErrorState, type HookErrorState } from '../lib/types/hook-error';

export interface UseFetchedResourceResult<T> {
  data: T | undefined;
  error: HookErrorState | null;
  isError: boolean;
  isLoading: boolean;
}

export interface UseFetchedResourceParams<T> {
  fetcher: (signal: AbortSignal) => Promise<T>;
  deps: ReadonlyArray<unknown>;
  onSuccess?: (data: T) => void;
}

/**
 * Generic data-fetching hook. Consolidates the (state, abortable effect,
 * typed error state) pattern shared by useUser, useUserPosts, and
 * useFriends. Returns the raw fetch result; wrappers translate the shape
 * to the legacy per-hook contract (e.g. `user` vs `data`, `loading` vs
 * `isLoading`).
 *
 * NOTE: `deps` is forwarded to `useEffect`. This is the standard
 * react-use/swr-style custom-hook factory pattern; callers pass the same
 * array they would have inlined.
 */
export const useFetchedResource = <T>({
  fetcher,
  deps,
  onSuccess,
}: UseFetchedResourceParams<T>): UseFetchedResourceResult<T> => {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<HookErrorState | null>(null);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    setIsError(false);
    setError(null);
    setIsLoading(true);

    fetcher(signal)
      .then((result) => {
        if (signal.aborted) return;
        setData(result);
        onSuccess?.(result);
        setIsLoading(false);
      })
      .catch((err) => {
        if (signal.aborted) return;
        setIsError(true);
        setError(toHookErrorState(err));
        setIsLoading(false);
      });

    return () => controller.abort();
  }, deps);

  return { data, error, isError, isLoading };
};
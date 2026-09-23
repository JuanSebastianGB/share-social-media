import type { AppStore, PostApiModel } from '@/models';
import { toHookErrorState, type HookErrorState } from '@/shared/lib/types/hook-error';
import { fetchUserPostsService } from '@/features/feed/api';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export const useUserPosts = (userId: string) => {
  const [error, setError] = useState<HookErrorState | null>(null);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<PostApiModel[]>([]);
  const { posts } = useSelector((store: AppStore) => store.posts);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    fetchUserPostsService(userId, { signal })
      .then((data) => {
        setIsLoading(true);
        setIsError(false);
        setError(null);
        setResults(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
        if (signal.aborted) return;
        setIsError(true);
        setError(toHookErrorState(err));
      });

    return () => controller.abort();
  }, [posts]);

  return { error, isError, results, isLoading };
};
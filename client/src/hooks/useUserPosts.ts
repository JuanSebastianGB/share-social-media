import { AppStore, PostApiModel } from '@/models';
import { fetchUserPostsService } from '@/services';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export const useUserPosts = (userId: string) => {
  const [error, setError] = useState({});
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<PostApiModel[]>([]);
  const { posts } = useSelector((store: AppStore) => store.auth);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    fetchUserPostsService(userId, { signal })
      .then((data) => {
        setIsLoading(true);
        setIsError(false);
        setError({});
        setResults(data);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        if (signal.aborted) return;
        setIsError(true);
        setError({ error });
      });

    return () => controller.abort();
  }, [posts]);

  return { error, isError, results, isLoading };
};

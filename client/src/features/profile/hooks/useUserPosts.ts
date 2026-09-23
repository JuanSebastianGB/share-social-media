import type { AppStore, PostApiModel } from '@/models';
import { useFetchedResource } from '@/shared/hooks/useFetchedResource';
import { fetchUserPostsService } from '@/features/feed/api';
import { useSelector } from 'react-redux';

export const useUserPosts = (userId: string) => {
  const { posts } = useSelector((store: AppStore) => store.posts);
  const { data, error, isError, isLoading } = useFetchedResource<PostApiModel[]>({
    fetcher: (signal) => fetchUserPostsService(userId, { signal }),
    deps: [posts],
  });
  return { error, isError, results: data ?? [], isLoading };
};
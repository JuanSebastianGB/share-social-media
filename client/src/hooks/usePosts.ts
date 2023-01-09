import { AppStore } from '@/models';
import { fetchPostsService } from '@/services';
import { useSelector } from 'react-redux';
import useSWR from 'swr';

/**
 * It fetches posts from the server and returns the response.
 * @returns The response object is being returned.
 */
export const usePosts = () => {
  const { token } = useSelector((store: AppStore) => store.auth);
  const fetcher = async () => await fetchPostsService({ token });
  const response = useSWR('posts', fetcher);
  return response;
};

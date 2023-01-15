import { AppStore } from '@/models';
import { fetchPostsService, fetchUserPostsService } from '@/services';
import { useSelector } from 'react-redux';
import useSWR from 'swr';

/**
 * It fetches posts from the server and returns the response.
 * @returns The response object is being returned.
 */
export const usePosts = () => {
  const fetcher = async () => await fetchPostsService();
  const response = useSWR('posts', fetcher);
  return response;
};

/**
 * It fetches the posts of the currently logged in user.
 * @returns The response object is being returned.
 */
export const useOwnPosts = () => {
  const { id } = useSelector((store: AppStore) => store.auth.user);
  const fetcher = async () => fetchUserPostsService(id);
  const response = useSWR('user/posts', fetcher);
  return response;
};

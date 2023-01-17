import { AppStore } from '@/models';
import { setPosts } from '@/redux/states/authSlice';
import { fetchPostsService, fetchUserPostsService } from '@/services';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useSWR from 'swr';

/**
 * It fetches posts from the server and returns the response.
 * @returns The response object is being returned.
 */
export const usePosts = () => {
  const dispatch = useDispatch();
  const getPosts = async () => {
    try {
      const response = await fetchPostsService();
      dispatch(setPosts({ posts: response }));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getPosts();
  }, []);

  return {};
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

import { AppStore } from '@/models';
import { setPosts } from '@/redux/states/authSlice';
import { fetchPostsService, fetchUserPostsService } from '@/services';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * It fetches posts from the server and returns the response.
 * @returns The response object is being returned.
 */
export const usePosts = (isProfile: boolean, id: string | undefined) => {
  const { friends, posts } = useSelector((store: AppStore) => store.auth);
  const dispatch = useDispatch();

  const getPosts = async () => {
    const response = await fetchPostsService();
    dispatch(setPosts({ posts: response }));
  };
  const getUserPosts = async () => {
    const response = await fetchUserPostsService(id);
    dispatch(setPosts({ posts: response }));
  };

  useEffect(() => {
    if (!isProfile) {
      getPosts();
    } else {
      getUserPosts();
    }
  }, [id]);

  return { friends, posts };
};

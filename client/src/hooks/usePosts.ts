import { AppStore } from '@/models';
import { growPostList, setPosts } from '@/redux/states/authSlice';
import { fetchPostsService, fetchUserPostsService } from '@/services';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * It fetches posts from the server and returns the response.
 * @returns The response object is being returned.
 */
export const usePosts = (
  isProfile: boolean,
  id: string | undefined
  // page: number = 1
) => {
  const page = useSelector((store: AppStore) => store.auth.page);
  const [error, setError] = useState({});
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const { friends, posts } = useSelector((store: AppStore) => store.auth);

  const dispatch = useDispatch();

  const getUserPosts = async () => {
    const response = await fetchUserPostsService(id);
    dispatch(setPosts({ posts: response }));
  };

  useEffect(() => {
    setError({});
    setIsError(false);
    setIsLoading(true);
    const controller = new AbortController();
    const { signal } = controller;

    if (!isProfile) {
      fetchPostsService(page, {})
        .then((data) => {
          dispatch(growPostList(data));
          setHasNextPage(!!data.length);
          setIsLoading(false);
        })
        .catch((error) => {
          setIsLoading(false);
          if (signal.aborted) return;
          setError({ error });
          setIsError(true);
        });
    } else {
      getUserPosts();
    }

    return controller.abort();
  }, [id, page]);

  return { friends, posts, error, isError, isLoading, hasNextPage };
};

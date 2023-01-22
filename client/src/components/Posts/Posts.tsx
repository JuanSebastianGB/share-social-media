import { usePosts } from '@/hooks';
import { PostApiModel, UserApiModel } from '@/models';
import { incrementPage } from '@/redux/states/authSlice';
import { ErrorBoundary } from '@/utilities';
import { useTheme } from '@mui/material';
import React, { useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { SpaceBetween } from '../Navbar';
import { Spinner } from '../Spinner';
import Post from './Post/Post';
export interface Props {
  isProfile?: boolean;
  id?: string;
}

const Posts: React.FC<Props> = ({ isProfile = false, id }) => {
  const dispatch = useDispatch();
  const theme = useTheme();

  const { friends, posts, error, hasNextPage, isError, isLoading } = usePosts(
    isProfile,
    id
  );

  const intObserver = useRef<any>();
  const lastPostRef = useCallback(
    (post: PostApiModel) => {
      if (isLoading) return;
      if (intObserver.current) intObserver.current.disconnect();
      intObserver.current = new IntersectionObserver((posts) => {
        if (posts[0].isIntersecting && hasNextPage) {
          console.log('Almost there...');
          dispatch(incrementPage({}));
        }
      });
      if (post) intObserver.current.observe(post);
    },
    [isLoading, hasNextPage]
  );

  if (isError) return <p> {JSON.stringify(error)}</p>;

  const content = posts.map((post, index) => {
    const idPostUser = post.user._id;
    const isFriend = !!friends.find(
      (friend: UserApiModel) => friend._id === idPostUser
    );
    if (posts.length === index + 1)
      return (
        <Post
          ref={lastPostRef}
          key={`${index}a`}
          // @ts-ignore
          isFriend={isFriend}
          {...post}
        />
      );
    // @ts-ignore
    return <Post key={`${index}a`} isFriend={isFriend} {...post} />;
  });

  if (!!!posts) return <>Loading</>;
  return (
    <ErrorBoundary
      fallBackComponent={<>Error in Posts</>}
      resetCondition={posts}
    >
      {/* {posts &&
        friends &&
        posts.map((post: PostApiModel, index) => {
          const idPostUser = post.user._id;
          const isFriend = !!friends.find(
            (friend: UserApiModel) => friend._id === idPostUser
          );
          // @ts-ignore
          return <Post key={index} isFriend={isFriend} {...post} />;
        })} */}
      {content}
      {isLoading && (
        <SpaceBetween>
          <Spinner />
        </SpaceBetween>
      )}
    </ErrorBoundary>
  );
};

export default Posts;

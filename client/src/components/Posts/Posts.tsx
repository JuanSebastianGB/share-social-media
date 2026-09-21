import { useFriends, usePosts } from '@/hooks';
import { PostApiModel, UserApiModel } from '@/models';
import { incrementPage } from '@/redux/states/postsSlice';
import { ErrorBoundary } from '@/utilities';
import { Box, Typography, useTheme } from '@mui/material';
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
  const theme = useTheme();
  const dispatch = useDispatch();
  // @ts-ignore
  const { friends } = useFriends(id);
  const { posts, hasNextPage, isError, isLoading } = usePosts(isProfile, id);
  const intObserver = useRef<any>();
  const lastPostRef = useCallback(
    (post: PostApiModel) => {
      if (isLoading) return;
      if (intObserver.current) intObserver.current.disconnect();
      intObserver.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          dispatch(incrementPage({}));
        }
      });
      if (post) intObserver.current.observe(post);
    },
    [isLoading, hasNextPage]
  );

  if (isError)
    return (
      <Typography variant="body2" color="error" align="center" sx={{ py: 2 }}>
        Couldn't load posts. Try refreshing the page.
      </Typography>
    );

  if (!posts) return <Spinner />;

  if (!isLoading && posts.length === 0) {
    return (
      <Box
        sx={{
          backgroundColor: theme.palette.background.paper,
          borderRadius: '10px',
          padding: '1.5rem 1rem',
          textAlign: 'center',
        }}
      >
        <Typography variant="h6" color={theme.palette.primary.main} gutterBottom>
          No posts yet
        </Typography>
        <Typography variant="body2" color={theme.palette.neutral.dark}>
          {isProfile
            ? 'This profile has no posts to show.'
            : 'Share your first post above to start the feed.'}
        </Typography>
      </Box>
    );
  }

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

  return (
    <ErrorBoundary
      fallBackComponent={<>Couldn't display posts.</>}
      resetCondition={posts}
    >
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

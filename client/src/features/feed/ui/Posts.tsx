import { AppStore, PostApiModel, UserApiModel } from '@/models';
import { incrementPage, searchPosts } from '@/redux/states/postsSlice';
import { ErrorContent, Spinner } from '@/components';
import { SpaceBetween } from '@/components/Navbar';
import { ErrorBoundary } from '@/utilities';
import { Box, Button, Typography, useTheme } from '@mui/material';
import React, { useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePosts } from '../hooks';
import Post from './Post/Post';

export interface Props {
  isProfile?: boolean;
  id?: string;
}

const Posts: React.FC<Props> = ({ isProfile = false, id }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const searchQuery = useSelector((store: AppStore) => store.posts.search);
  const friends = useSelector((store: AppStore) => store.friends.friends);
  const isSearchActive = !isProfile && searchQuery.trim().length > 0;
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
      <ErrorContent
        message="Couldn't load posts."
        sx={{ width: '100%', minHeight: '120px' }}
      />
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
          {isSearchActive ? 'No matching posts' : 'No posts yet'}
        </Typography>
        <Typography variant="body2" color={theme.palette.neutral.dark}>
          {isProfile
            ? 'This profile has no posts to show.'
            : isSearchActive
              ? 'Try another search or clear the filter.'
              : 'Share your first post above to start the feed.'}
        </Typography>
        {isSearchActive && (
          <Button
            size="small"
            onClick={() => dispatch(searchPosts(''))}
            aria-label="Clear search"
            sx={{ mt: '0.75rem' }}
          >
            Clear
          </Button>
        )}
      </Box>
    );
  }

  const content = posts.map((post, index) => {
    const idPostUser = post.user._id;
    const isFriend = !!(friends ?? []).find(
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
      fallBackComponent={
        <ErrorContent
          message="Couldn't display posts."
          sx={{ width: '100%', minHeight: '120px', flex: 'unset', margin: '0' }}
        />
      }
      resetCondition={posts}
    >
      {isSearchActive && (
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            borderRadius: '10px',
            padding: '0.5rem 1rem',
            mb: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          <Typography
            variant="caption"
            color={theme.palette.neutral.main}
            sx={{ minWidth: 0 }}
          >
            Matching &quot;{searchQuery.trim()}&quot;
          </Typography>
          <Button
            size="small"
            onClick={() => dispatch(searchPosts(''))}
            aria-label="Clear search"
          >
            Clear
          </Button>
        </Box>
      )}
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

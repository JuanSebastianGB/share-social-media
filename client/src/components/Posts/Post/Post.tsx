import { postAdapter } from '@/adapters';
import { AppStore, PostApiModel } from '@/models';
import { toggleFriend, togglePostLikes } from '@/redux/states/authSlice';
import { fetchToggleFriendUserService, likePostService } from '@/services';
import { SpaceBetween } from '@/styled-components';
import ChatIcon from '@mui/icons-material/Chat';
import ShareIcon from '@mui/icons-material/Share';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import { Box, IconButton, Typography, useTheme } from '@mui/material';
import React, { forwardRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PostSection } from './PostSection';
export interface Props extends PostApiModel {
  isFriend: boolean;
}

// @ts-ignore
const Post = forwardRef(({ isFriend, ...post }, ref) => {
  const { id } = useSelector((store: AppStore) => store.auth.user);
  // @ts-ignore
  const isOwn = id === post.user._id;
  const theme = useTheme();
  // @ts-ignore
  const adaptedPost = postAdapter(post);
  const { user: userPost } = adaptedPost;
  const checkIsLikedOwn = (likes: {}, userId: string): boolean =>
    Object.keys(likes).some((row) => {
      return row === userId;
    });
  const dispatch = useDispatch();

  const isLikedOwn = checkIsLikedOwn(adaptedPost.likes, id);

  const handleClick = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    try {
      const friendId = userPost._id;
      const friends = await fetchToggleFriendUserService<string>(id, friendId);
      dispatch(toggleFriend(friends));
    } catch (error) {
      console.log({ error });
    }
  };
  const handleLike = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    try {
      const response = await likePostService(adaptedPost.id, { userId: id });
      dispatch(togglePostLikes(response));
    } catch (error) {
      console.log(error);
    }
  };

  const postBody = (
    <>
      <PostSection
        userPost={userPost}
        isOwn={isOwn}
        isFriend={isFriend}
        handleClick={handleClick}
        body={adaptedPost.body}
      />
      <Box
        component="img"
        className="image"
        sx={{
          width: '100%',
          objectFit: 'cover',
          minHeight: '450px',
          borderRadius: '10px',
        }}
        // @ts-ignore
        src={adaptedPost.file.url}
        alt="idea"
      />
      <SpaceBetween>
        <IconButton aria-label="share">
          <ShareIcon
            sx={{ fontSize: '18px', color: theme.palette.neutral.dark }}
          />
        </IconButton>
        <SpaceBetween gap="10px">
          <SpaceBetween>
            <IconButton
              aria-label="likes"
              onClick={handleLike}
              disabled={isOwn}
            >
              <ThumbUpOffAltIcon
                sx={{
                  fontSize: '18px',
                  color: isLikedOwn
                    ? theme.palette.primary.dark
                    : theme.palette.neutral.dark,
                }}
              />
            </IconButton>
            <Typography variant="caption" color={theme.palette.neutral.main}>
              {Object.values(adaptedPost?.likes).length}
            </Typography>
          </SpaceBetween>
          <SpaceBetween>
            <IconButton aria-label="comments">
              <ChatIcon sx={{ fontSize: '18px' }} />
            </IconButton>
            <Typography variant="caption" color={theme.palette.neutral.main}>
              10
            </Typography>
          </SpaceBetween>
        </SpaceBetween>
      </SpaceBetween>
    </>
  );

  const content = ref ? (
    <Box
      ref={ref}
      key={adaptedPost.id}
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderRadius: '10px',
        padding: '1rem',
        mb: '10px',
      }}
    >
      {postBody}
    </Box>
  ) : (
    <Box
      key={adaptedPost.id}
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderRadius: '10px',
        padding: '1rem',
        mb: '10px',
      }}
    >
      {postBody}
    </Box>
  );

  return content;
});

export default Post;

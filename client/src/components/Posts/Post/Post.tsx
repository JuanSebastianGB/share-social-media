import { postAdapter } from '@/adapters';
import { AppStore, PostApiModel } from '@/models';
import { useHomeContext } from '@/pages/Home/context';
import { fetchToggleFriendUserService, likePostService } from '@/services';
import { SpaceBetween } from '@/styled-components';
import ChatIcon from '@mui/icons-material/Chat';
import ShareIcon from '@mui/icons-material/Share';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import { Box, IconButton, Typography, useTheme } from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';
import { PostSection } from './PostSection';
export interface Props extends PostApiModel {
  isFriend: boolean;
}

const Post: React.FC<Props> = ({ isFriend, ...post }) => {
  const { id } = useSelector((store: AppStore) => store.auth.user);

  const {
    friendsState: { mutateFriends },
    postsState: { mutatePosts },
  } = useHomeContext();
  const isOwn = id === post.user._id;
  const theme = useTheme();
  const adaptedPost = postAdapter(post);
  const { user: userPost } = adaptedPost;
  const checkIsLikedOwn = (likes: {}, userId: string): boolean =>
    Object.keys(likes).some((row) => {
      return row === userId;
    });

  const isLikedOwn = checkIsLikedOwn(adaptedPost.likes, id);

  const handleClick = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    try {
      const friendId = userPost._id;
      const response = await fetchToggleFriendUserService<string>(id, friendId);
      mutateFriends();
    } catch (error) {
      console.log({ error });
    }
  };
  const handleLike = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    try {
      await likePostService(adaptedPost.id, { userId: id });
      mutatePosts();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Box
      key={adaptedPost.id}
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderRadius: '10px',
        padding: '1rem',
        mb: '10px',
      }}
    >
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
    </Box>
  );
};

export default Post;

import { usePostInteractions } from '../../hooks';
import type { AppStore, PostApiModel, UserApiModel } from '@/models';
import { SpaceBetween } from '@/shared/ui/styled-components';
import ChatIcon from '@mui/icons-material/Chat';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Alert,
  Typography,
  useTheme,
} from '@mui/material';
import React, { forwardRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { CommentsModal } from './CommentsModal';
import { PostSection } from './PostSection';

export interface Props extends PostApiModel {
  isFriend: boolean;
}

const checkIsLikedOwn = (
  likes: PostApiModel['likes'],
  userId: string,
): boolean => Object.prototype.hasOwnProperty.call(likes, userId);

const Post = forwardRef<HTMLDivElement, Props>(({ isFriend, ...post }, ref) => {
  const [openModal, setOpenModal] = useState(false);
  const authUser = useSelector((store: AppStore) => store.auth.user);
  const isOwn = authUser._id === post.user._id;
  const theme = useTheme();
  const userPost: UserApiModel = post.user;

  const isLikedOwn = checkIsLikedOwn(post.likes, authUser._id);

  const {
    confirmUnfriendOpen,
    setConfirmUnfriendOpen,
    friendPending,
    likePending,
    snackbar,
    closeSnackbar,
    toggleFriendApi,
    handleClick,
    handleLike,
  } = usePostInteractions({
    postId: post._id,
    authorId: userPost._id,
    isFriend,
  });

  const postBody = (
    <>
      <PostSection
        userPost={userPost}
        isOwn={isOwn}
        isFriend={isFriend}
        handleClick={handleClick}
        body={post.body}
        disabled={friendPending}
      />
      {post.type !== 'comment' && (
        <Box
          component="img"
          className="image"
          sx={{
            width: '100%',
            objectFit: 'cover',
            minHeight: { xs: 200, md: 450 },
            borderRadius: '10px',
          }}
          src={post.file.url}
          alt={post.body ? `Post by ${userPost.firstName} ${userPost.lastName}`.trim() : 'Post image'}
        />
      )}
      <SpaceBetween sx={{ justifyContent: 'flex-end' }}>
        <SpaceBetween gap="10px">
          <SpaceBetween>
            <IconButton
              aria-label={isOwn ? "You can't like your own post" : 'Like post'}
              title={isOwn ? "You can't like your own post" : 'Like post'}
              onClick={handleLike}
              disabled={isOwn || likePending}
            >
              <ThumbUpOffAltIcon
                fontSize="small"
                sx={{
                  color: isLikedOwn
                    ? theme.palette.primary.dark
                    : theme.palette.neutral.dark,
                }}
              />
            </IconButton>
            <Typography variant="caption" color={theme.palette.neutral.main}>
              {Object.keys(post.likes).length}
            </Typography>
          </SpaceBetween>
          {openModal && (
            <CommentsModal
              onClose={() => setOpenModal(false)}
              open={openModal}
              post={post}
              isOwn={isOwn}
            />
          )}

          <SpaceBetween>
            <IconButton
              aria-label="View comments"
              onClick={() => setOpenModal(true)}
            >
              <ChatIcon fontSize="small" />
            </IconButton>
            <Typography variant="caption" color={theme.palette.neutral.main}>
              {post.comments.length}
            </Typography>
          </SpaceBetween>
        </SpaceBetween>
      </SpaceBetween>

      <Dialog
        open={confirmUnfriendOpen}
        onClose={() => !friendPending && setConfirmUnfriendOpen(false)}
      >
        <DialogTitle>Remove friend?</DialogTitle>
        <DialogContent>
          <Typography>
            Remove {`${userPost.firstName} ${userPost.lastName}`.trim() || 'this friend'} from your friends?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmUnfriendOpen(false)}
            disabled={friendPending}
          >
            Cancel
          </Button>
          <Button
            onClick={toggleFriendApi}
            color="warning"
            disabled={friendPending}
          >
            Remove friend
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );

  return (
    <Box
      ref={ref}
      key={post._id}
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
});

Post.displayName = 'Post';
export default Post;
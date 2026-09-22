import { postAdapter } from '@/adapters';
import { usePostInteractions } from '@/hooks';
import { AppStore, PostApiModel } from '@/models';
import { SpaceBetween } from '@/styled-components';
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

// @ts-ignore
const Post = forwardRef(({ isFriend, ...post }, ref) => {
  const [openModal, setOpenModal] = useState(false);
  const { id } = useSelector((store: AppStore) => store.auth.user);
  // @ts-ignore
  const isOwn = id === post.user._id;
  const theme = useTheme();
  // @ts-ignore
  const adaptedPost = postAdapter(post);
  const { user: userPost } = adaptedPost;
  const friendName = `${userPost.firstName} ${userPost.lastName}`.trim();
  const checkIsLikedOwn = (likes: {}, userId: string): boolean =>
    Object.keys(likes).some((row) => {
      return row === userId;
    });

  const isLikedOwn = checkIsLikedOwn(adaptedPost.likes, id);

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
    postId: adaptedPost.id,
    authorId: userPost._id,
    isFriend,
  });

  const postBody = (
    <>
      <PostSection
        userPost={userPost}
        isOwn={isOwn}
        isFriend={isFriend}
        // @ts-ignore
        handleClick={handleClick}
        body={adaptedPost.body}
        disabled={friendPending}
      />
      {
        // @ts-ignore
        adaptedPost?.type !== 'comment' && (
          <Box
            component="img"
            className="image"
            sx={{
              width: '100%',
              objectFit: 'cover',
              minHeight: { xs: 200, md: 450 },
              borderRadius: '10px',
            }}
            // @ts-ignore
            src={adaptedPost.file.url}
            alt={adaptedPost.body ? `Post by ${friendName}` : 'Post image'}
          />
        )
      }
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
              {Object.values(adaptedPost?.likes).length}
            </Typography>
          </SpaceBetween>
          {openModal && (
            <CommentsModal
              onClose={() => setOpenModal(false)}
              open={openModal}
              post={post as PostApiModel}
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
              {
                // @ts-ignore
                post.comments.length
              }
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
            Remove {friendName || 'this friend'} from your friends?
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

import { useFriends } from '@/hooks';
import { UserApiModel } from '@/models';
import { removeFriend } from '@/redux/states/friendsSlice';
import { fetchToggleFriendUserService } from '@/services';
import { ErrorBoundary } from '@/utilities';
import { PersonRemove } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Snackbar,
  Typography,
  useTheme,
} from '@mui/material';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { AvatarWithTitles } from '../AvatarWithTitles';
import { ErrorContent } from '../ErrorContent';
import { SpaceBetween } from '../Navbar';
import { Spinner } from '../Spinner';
export interface Props {
  user: UserApiModel;
}

const Friends: React.FC<Props> = ({ user }) => {
  const theme = useTheme();
  const { friends, error, isError, isLoading } = useFriends(user?._id);
  const dispatch = useDispatch();
  const { id } = useParams();
  const isProfile = !!id;
  const [pendingFriendId, setPendingFriendId] = useState<string | null>(null);
  const [confirmFriend, setConfirmFriend] = useState<UserApiModel | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'error' | 'success';
  }>({ open: false, message: '', severity: 'error' });

  const closeSnackbar = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));

  const handleRemoveFriend = async () => {
    if (!confirmFriend) return;
    const friendId = confirmFriend._id;
    setPendingFriendId(friendId);
    try {
      await fetchToggleFriendUserService<string>(user._id, friendId);
      dispatch(removeFriend(friendId));
      setConfirmFriend(null);
      setSnackbar({
        open: true,
        message: 'Friend removed',
        severity: 'success',
      });
    } catch {
      setSnackbar({
        open: true,
        message: "Couldn't remove friend. Please try again.",
        severity: 'error',
      });
    } finally {
      setPendingFriendId(null);
    }
  };

  if (isLoading) return <Spinner />;
  if (isError)
    return (
      <ErrorContent
        // @ts-ignore
        message={error?.error?.message}
        // @ts-ignore
        data={error?.error?.response.data}
      />
    );

  if (friends?.length === 0)
    return (
      <Typography variant="caption" color={theme.palette.neutral.dark}>
        No friends yet.
      </Typography>
    );

  const confirmName = confirmFriend
    ? `${confirmFriend.firstName} ${confirmFriend.lastName}`.trim()
    : '';
  const isPending = pendingFriendId !== null;

  return (
    <ErrorBoundary
      fallBackComponent={<>Error in Friends</>}
      resetCondition={friends}
    >
      <Box
        sx={{
          backgroundColor: theme.palette.background.paper,
          padding: ' 0.3rem 1rem',
          pb: '10px',
          borderRadius: '10px',
        }}
      >
        <Typography variant="h5" color={theme.palette.primary.main}>
          Friends
        </Typography>
        <Divider />
        {friends
          ? friends.map((friend, index: number) => (
              <Box key={friend._id}>
                <Box sx={{ m: '1rem 0 0.5rem' }}>
                  <SpaceBetween>
                    <AvatarWithTitles
                      key={friend._id}
                      profileImage={friend?.picturePath}
                      title={`${friend?.firstName} ${friend?.lastName}`}
                      subTitle={friend?.location}
                      userId={friend._id}
                    />
                    {!isProfile && (
                      <IconButton
                        aria-label="remove-friend"
                        color="warning"
                        disabled={isPending}
                        onClick={() => setConfirmFriend(friend)}
                      >
                        <PersonRemove fontSize="small" />
                      </IconButton>
                    )}
                  </SpaceBetween>
                </Box>
                {friends && index < friends.length - 1 && <Divider />}
              </Box>
            ))
          : null}
      </Box>

      <Dialog
        open={!!confirmFriend}
        onClose={() => !isPending && setConfirmFriend(null)}
      >
        <DialogTitle>Remove friend?</DialogTitle>
        <DialogContent>
          <Typography>
            Remove {confirmName || 'this friend'} from your friends?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmFriend(null)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRemoveFriend}
            color="warning"
            disabled={isPending}
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
    </ErrorBoundary>
  );
};

export default Friends;

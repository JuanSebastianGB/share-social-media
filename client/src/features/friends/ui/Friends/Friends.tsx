import { AvatarWithTitles, ErrorContent, Spinner } from '@/shared/ui';
import { SpaceBetween } from '@/shared/ui/Navbar';
import { UserApiModel } from '@/models';
import { ErrorBoundary } from '@/shared/lib/utilities';
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
import React from 'react';
import { useParams } from 'react-router-dom';
import { useFriends } from '../../hooks/useFriends';
import { useRemoveFriend } from '../../hooks/useRemoveFriend';
export interface Props {
  user: UserApiModel;
}

const Friends: React.FC<Props> = ({ user }) => {
  const theme = useTheme();
  const { friends, error, isError, isLoading } = useFriends(user?._id);
  const { id } = useParams();
  const isProfile = !!id;
  const {
    pendingFriendId,
    confirmFriend,
    setConfirmFriend,
    snackbar,
    closeSnackbar,
    handleRemoveFriend,
  } = useRemoveFriend(user._id);

  if (isLoading) return <Spinner />;
  if (isError)
    return (
      <ErrorContent
        message={error?.error?.message}
        data={error?.error?.response?.data}
      />
    );

  const confirmName = confirmFriend
    ? `${confirmFriend.firstName} ${confirmFriend.lastName}`.trim()
    : '';
  const isPending = pendingFriendId !== null;
  const hasFriends = !!friends && friends.length > 0;

  return (
    <ErrorBoundary
      fallBackComponent={
        <ErrorContent
          message="Couldn't display friends."
          sx={{ width: '100%', minHeight: '120px', flex: 'unset', margin: '0' }}
        />
      }
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
        {hasFriends && (
          <Typography
            variant="caption"
            color={theme.palette.neutral.main}
            display="block"
            sx={{ mt: '0.15rem', mb: '0.25rem' }}
          >
            {friends.length} friends
          </Typography>
        )}
        <Divider />
        {!hasFriends ? (
          <Box sx={{ py: '1rem' }}>
            <Typography variant="body2" color={theme.palette.neutral.dark}>
              No friends yet.
            </Typography>
            <Typography
              variant="caption"
              color={theme.palette.neutral.main}
              display="block"
              sx={{ mt: '0.35rem' }}
            >
              Add someone from a post in your feed to see them here.
            </Typography>
          </Box>
        ) : (
          friends.map((friend, index: number) => {
            const friendName =
              `${friend?.firstName ?? ''} ${friend?.lastName ?? ''}`.trim() ||
              'friend';
            return (
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
                        aria-label={`Remove ${friendName}`}
                        title={`Remove ${friendName}`}
                        color="warning"
                        disabled={isPending}
                        onClick={() => setConfirmFriend(friend)}
                      >
                        <PersonRemove fontSize="small" />
                      </IconButton>
                    )}
                  </SpaceBetween>
                </Box>
                {index < friends.length - 1 && <Divider />}
              </Box>
            );
          })
        )}
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

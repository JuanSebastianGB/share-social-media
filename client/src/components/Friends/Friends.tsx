import { useFriends } from '@/hooks';
import { UserApiModel } from '@/models';
import { removeFriend } from '@/redux/states/authSlice';
import { fetchToggleFriendUserService } from '@/services';
import { ErrorBoundary } from '@/utilities';
import { PersonRemove } from '@mui/icons-material';
import { Box, Divider, IconButton, Typography, useTheme } from '@mui/material';
import React from 'react';
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
  const { friends, error, isError, isLoading } = useFriends(user._id);
  const dispatch = useDispatch();
  const { id } = useParams();
  const isProfile = !!id;

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

  if (friends?.length === 0) return <>Not friends Found</>;

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
                        onClick={async () => {
                          try {
                            const friendId = friend._id;
                            await fetchToggleFriendUserService<string>(
                              user._id,
                              friendId
                            );
                            dispatch(removeFriend(friendId));
                          } catch (error) {
                            console.log({ error });
                          }
                        }}
                      >
                        <PersonRemove sx={{ fontSize: '18px' }} />
                      </IconButton>
                    )}
                  </SpaceBetween>
                </Box>
                {friends && index < friends.length - 1 && <Divider />}
              </Box>
            ))
          : null}
      </Box>
    </ErrorBoundary>
  );
};

export default Friends;

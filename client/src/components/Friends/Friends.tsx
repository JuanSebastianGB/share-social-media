import { UserApiModel } from '@/models';
import { useHomeContext } from '@/pages/Home/context';
import { fetchToggleFriendUserService } from '@/services';
import { ErrorBoundary } from '@/utilities';
import { PersonRemove } from '@mui/icons-material';
import { Box, Divider, IconButton, Typography, useTheme } from '@mui/material';
import React from 'react';
import { AvatarWithTitles } from '../AvatarWithTitles';
import { SpaceBetween } from '../Navbar';
export interface Props {
  id: string;
}

const Friends: React.FC<Props> = ({ id }) => {
  const {
    friendsState: { friends, mutateFriends },
  } = useHomeContext();

  const theme = useTheme();

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
        {friends &&
          friends.map((friend: UserApiModel, index: number) => (
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
                  <IconButton
                    aria-label="remove-friend"
                    color="warning"
                    onClick={async () => {
                      try {
                        const friendId = friend._id;
                        await fetchToggleFriendUserService<string>(
                          id,
                          friendId
                        );
                        mutateFriends();
                      } catch (error) {
                        console.log({ error });
                      }
                    }}
                  >
                    <PersonRemove sx={{ fontSize: '18px' }} />
                  </IconButton>
                </SpaceBetween>
              </Box>
              {friends && index < friends.length - 1 && <Divider />}
            </Box>
          ))}
      </Box>
    </ErrorBoundary>
  );
};

export default Friends;

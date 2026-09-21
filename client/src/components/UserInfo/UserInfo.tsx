import { useFriends, useUserPosts } from '@/hooks';
import { UserApiModel } from '@/models';
import { ErrorBoundary } from '@/utilities';
import {
  DynamicFeed,
  Groups2,
  LocationOn,
  WorkOutline,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Divider,
  styled,
  Typography,
  useTheme,
} from '@mui/material';
import React from 'react';
import { ErrorContent } from '../ErrorContent';
import { SpaceBetween } from '../Navbar';
import { Spinner } from '../Spinner';
export interface Props {
  user: UserApiModel;
}

const StyledUserInfo = styled(Box)(({ theme }) => ({
  width: '100%',
  backgroundColor: theme.palette.background.paper,
  padding: '0.7rem',
  borderRadius: '10px',
}));

const UserInfo: React.FC<Props> = ({ user }) => {
  const theme = useTheme();
  const { friends } = useFriends(user._id);
  const {
    error,
    isError,
    isLoading,
    results: ownPosts,
  } = useUserPosts(user._id);

  const avatarAlt =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    'User avatar';

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

  return (
    <ErrorBoundary
      fallBackComponent={<>Error in User info</>}
      resetCondition={user}
    >
      <StyledUserInfo>
        <Typography
          variant="h6"
          align="center"
          color={theme.palette.primary.main}
          sx={{ fontWeight: 700 }}
        >
          {user?.firstName}
        </Typography>
        <Box
          sx={{
            padding: '1rem',
            position: 'relative',
          }}
        >
          <Avatar
            sx={{
              width: 100,
              height: 100,
              zIndex: 1,
              margin: '0 auto',
            }}
            alt={avatarAlt}
            sizes=""
            src={user?.picturePath}
          />
          <Box
            sx={{
              width: '100%',
              transform: 'translate(0, -55px) scale(1)',
            }}
          >
            <SpaceBetween sx={{ gap: '0.5rem' }}>
              <SpaceBetween>
                <Groups2 fontSize="small" sx={{ mr: '5px' }} />
                <Typography
                  variant="caption"
                  color={theme.palette.neutral.dark}
                >
                  {friends ? friends?.length : null} friends
                </Typography>
              </SpaceBetween>
              <SpaceBetween>
                <DynamicFeed fontSize="small" sx={{ mr: '5px' }} />
                <Typography
                  variant="caption"
                  color={theme.palette.neutral.dark}
                >
                  {ownPosts ? ownPosts?.length : null} posts
                </Typography>
              </SpaceBetween>
            </SpaceBetween>
            <Divider />
          </Box>
        </Box>
        <Divider />
        <SpaceBetween
          gap="0.7rem"
          sx={{ justifyContent: 'flex-start', padding: '10px 0' }}
        >
          <LocationOn fontSize="small" />
          <Typography variant="caption" color={theme.palette.neutral.dark}>
            {user?.location}
          </Typography>
        </SpaceBetween>
        <SpaceBetween
          gap="0.7rem"
          sx={{ justifyContent: 'flex-start', padding: '10px 0' }}
        >
          <WorkOutline fontSize="small" />
          <Typography variant="caption" color={theme.palette.neutral.dark}>
            {user?.occupation}
          </Typography>
        </SpaceBetween>
      </StyledUserInfo>
    </ErrorBoundary>
  );
};

export default UserInfo;

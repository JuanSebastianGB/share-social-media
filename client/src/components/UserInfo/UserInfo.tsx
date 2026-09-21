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
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const { friends } = useFriends(user._id);
  const {
    error,
    isError,
    isLoading,
    results: ownPosts,
  } = useUserPosts(user._id);

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'User';
  const avatarAlt = `${displayName} avatar`;
  const profilePath = `/profile/${user._id}`;

  const goToProfile = () => {
    navigate(profilePath);
  };

  const handleProfileKeyDown = (
    event: React.KeyboardEvent<HTMLElement>
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      goToProfile();
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

  return (
    <ErrorBoundary
      fallBackComponent={
        <ErrorContent
          message="Couldn't display profile info."
          sx={{ width: '100%', minHeight: '120px', flex: 'unset', margin: '0' }}
        />
      }
      resetCondition={user}
    >
      <StyledUserInfo>
        <Typography
          variant="h5"
          align="center"
          color={theme.palette.primary.main}
          role="link"
          tabIndex={0}
          aria-label={`View ${displayName}'s profile`}
          onClick={goToProfile}
          onKeyDown={handleProfileKeyDown}
          sx={{ fontWeight: 700, cursor: 'pointer' }}
        >
          {displayName}
        </Typography>
        <Box
          sx={{
            padding: '1rem',
            position: 'relative',
          }}
        >
          <Avatar
            role="link"
            tabIndex={0}
            aria-label={`View ${displayName}'s profile`}
            onClick={goToProfile}
            onKeyDown={handleProfileKeyDown}
            sx={{
              width: 100,
              height: 100,
              zIndex: 1,
              margin: '0 auto',
              cursor: 'pointer',
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
        {!!user?.location && (
          <SpaceBetween
            gap="0.7rem"
            sx={{ justifyContent: 'flex-start', padding: '10px 0' }}
          >
            <LocationOn fontSize="small" />
            <Typography variant="caption" color={theme.palette.neutral.dark}>
              {user.location}
            </Typography>
          </SpaceBetween>
        )}
        {!!user?.occupation && (
          <SpaceBetween
            gap="0.7rem"
            sx={{ justifyContent: 'flex-start', padding: '10px 0' }}
          >
            <WorkOutline fontSize="small" />
            <Typography variant="caption" color={theme.palette.neutral.dark}>
              {user.occupation}
            </Typography>
          </SpaceBetween>
        )}
      </StyledUserInfo>
    </ErrorBoundary>
  );
};

export default UserInfo;

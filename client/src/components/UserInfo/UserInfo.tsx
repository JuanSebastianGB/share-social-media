import { useUser } from '@/hooks';
import { useHomeContext } from '@/pages/Home/context';
import { ErrorBoundary } from '@/utilities';
import { Groups2, LocationOn, WorkOutline } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Divider,
  styled,
  Typography,
  useTheme,
} from '@mui/material';
import React from 'react';
import { SpaceBetween } from '../Navbar';
export interface Props {}

const StyledUserInfo = styled(Box)(({ theme }) => ({
  width: '100%',
  backgroundColor: theme.palette.background.paper,
  padding: '0.7rem',
  borderRadius: '10px',
}));

const UserInfo: React.FC<Props> = () => {
  const { data: user, error } = useUser();
  const {
    friendsState: { friends },
    ownPostsState: { ownPosts },
  } = useHomeContext();
  const theme = useTheme();

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
            display: 'flex',
            justifyContent: 'center',
            padding: '1rem',
            position: 'relative',
          }}
        >
          <Avatar
            sx={{
              width: 100,
              height: 100,
              zIndex: 100,
            }}
            alt="profile"
            sizes=""
            src={user?.picturePath}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '2.3rem',
              left: '0',
              width: '100%',
            }}
          >
            <SpaceBetween sx={{ gap: '0.5rem' }}>
              <SpaceBetween>
                <Groups2 sx={{ fontSize: '15px', mr: '5px' }} />
                <Typography
                  variant="caption"
                  color={theme.palette.neutral.mediumMain}
                >
                  {friends && friends?.length} friends
                </Typography>
              </SpaceBetween>
              <SpaceBetween>
                <Groups2 sx={{ fontSize: '15px', mr: '5px' }} />
                <Typography
                  variant="caption"
                  color={theme.palette.neutral.mediumMain}
                >
                  {ownPosts && ownPosts?.length} posts
                </Typography>
              </SpaceBetween>
            </SpaceBetween>
            <Divider />
          </Box>
        </Box>
        <Divider />
        <SpaceBetween
          sx={{
            pt: '5px',
            '& small': {
              color: theme.palette.neutral.main,
            },
          }}
        >
          <small>{user?.viewedProfile}</small>
          <Typography
            variant="caption"
            color={theme.palette.neutral.mediumMain}
          >
            Who's viewed your profile
          </Typography>
        </SpaceBetween>
        <SpaceBetween
          sx={{
            '& small': {
              color: theme.palette.neutral.main,
            },
          }}
        >
          <small>{user?.impressions}</small>
          <Typography
            variant="caption"
            color={theme.palette.neutral.mediumMain}
          >
            Impressions of your post
          </Typography>
        </SpaceBetween>
        <Divider />
        <SpaceBetween
          gap="0.7rem"
          sx={{ justifyContent: 'flex-start', padding: '10px 0' }}
        >
          <LocationOn />
          <Typography
            variant="caption"
            color={theme.palette.neutral.mediumMain}
          >
            {user?.location}
          </Typography>
        </SpaceBetween>
        <SpaceBetween
          gap="0.7rem"
          sx={{ justifyContent: 'flex-start', padding: '10px 0' }}
        >
          <WorkOutline />
          <Typography
            variant="caption"
            color={theme.palette.neutral.mediumMain}
          >
            {user?.occupation}
          </Typography>
        </SpaceBetween>
      </StyledUserInfo>
    </ErrorBoundary>
  );
};

export default UserInfo;

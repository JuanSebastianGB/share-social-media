import { useUser } from '@/hooks';
import { ErrorBoundary } from '@/utilities';
import { Avatar, Box, styled } from '@mui/material';
import React from 'react';
export interface Props {}

const StyledUserInfo = styled(Box)(({ theme }) => ({
  width: '100%',
}));

const UserInfo: React.FC<Props> = () => {
  const { data: user, error } = useUser();

  return (
    <ErrorBoundary
      fallBackComponent={<>Error in User info</>}
      resetCondition={user}
    >
      <StyledUserInfo>
        <Box
          sx={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}
        >
          <Avatar
            sx={{ width: 60, height: 60 }}
            alt="profile"
            sizes=""
            src={user?.picturePath}
          />
        </Box>
        <h1> User Info</h1>
        {error && <div>Error</div>}
        {user && JSON.stringify(user, null, 2)}
      </StyledUserInfo>
    </ErrorBoundary>
  );
};

export default UserInfo;

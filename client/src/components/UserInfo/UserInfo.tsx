import { useUser } from '@/hooks';
import { ErrorBoundary } from '@/utilities';
import { Box, styled } from '@mui/material';
import React from 'react';
export interface Props {}

const StyledUserInfo = styled(Box)(({ theme }) => ({
  width: '100%',
  background: 'blue',
}));

const UserInfo: React.FC<Props> = () => {
  const { data: user, error } = useUser();

  return (
    <ErrorBoundary
      fallBackComponent={<>Error in User info</>}
      resetCondition={user}
    >
      <StyledUserInfo>
        <div>avatar</div>
        <h1> User Info</h1>
        {error && <div>Error</div>}
        {user && JSON.stringify(user, null, 2)}
      </StyledUserInfo>
    </ErrorBoundary>
  );
};

export default UserInfo;

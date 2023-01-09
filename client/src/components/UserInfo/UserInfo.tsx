import { useUser } from '@/hooks';
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
    <StyledUserInfo>
      <div>avatar</div>
      <h1> User Info</h1>
      {error && <div>error</div>}
      {user && JSON.stringify(user, null, 2)}
    </StyledUserInfo>
  );
};

export default UserInfo;

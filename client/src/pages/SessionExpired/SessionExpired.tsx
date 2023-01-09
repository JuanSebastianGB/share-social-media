import { makeLogout } from '@/redux/states/authSlice';
import { Box, Button, Typography } from '@mui/material';
import { Orbit } from '@uiball/loaders';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
export interface SessionExpiredInterface {}

const SessionExpired: React.FC<SessionExpiredInterface> = () => {
  const dispatch = useDispatch();
  const [load, setLoad] = useState(false);

  const handleSessionLogout = () => {
    dispatch(makeLogout({}));
    setLoad(true);
  };
  return (
    <>
      <Typography variant="h3" align="center">
        Session Expired
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {!load && (
          <Button
            sx={{ margin: '0 auto' }}
            onClick={handleSessionLogout}
            variant="contained"
          >
            Back to login
          </Button>
        )}

        {load && (
          <>
            <Box>Loading please be patient</Box>
            <Box
              width="100%"
              height="300px"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Orbit size={50} color={'#231f20'} />
            </Box>
          </>
        )}
      </Box>
    </>
  );
};

export default SessionExpired;

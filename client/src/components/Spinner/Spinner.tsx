import { Box } from '@mui/material';
import { Momentum } from '@uiball/loaders/';
import React from 'react';
export interface SpinnerInterface {}

const Spinner: React.FC<SpinnerInterface> = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        height: '500px',
        width: '100%',
        alignItems: 'center',
      }}
    >
      <Momentum size={40} color="#000000" />
    </Box>
  );
};

export default Spinner;

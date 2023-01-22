import { Box } from '@mui/material';
import { Momentum } from '@uiball/loaders/';
import React from 'react';
export interface SpinnerInterface {
  sx?: object;
}

const Spinner: React.FC<SpinnerInterface> = ({ sx }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        height: '500px',
        width: '100%',
        alignItems: 'center',
        ...sx,
      }}
    >
      <Momentum size={40} color="#000000" />
    </Box>
  );
};

export default Spinner;

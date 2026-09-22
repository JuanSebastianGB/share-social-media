import { Box, useTheme } from '@mui/material';
import { Metronome } from '@uiball/loaders/';
import React from 'react';
export interface SpinnerInterface {
  sx?: object;
}

const Spinner: React.FC<SpinnerInterface> = ({ sx }) => {
  const theme = useTheme();
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
      <Metronome size={50} color={theme.palette.primary.main} />
    </Box>
  );
};

export default Spinner;

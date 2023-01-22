import { Box, Typography } from '@mui/material';
import React from 'react';
export interface Props {
  message: string;
  data: string;
  sx?: object;
}

const ErrorContent: React.FC<Props> = ({ message, data, sx }) => {
  return (
    <Box
      sx={{
        minHeight: '200px',
        bgcolor: 'red',
        width: '50%',
        margin: '2rem auto',
        padding: 'rem',
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        '& > *': {
          padding: '2rem',
        },
        flex: 0.5,
        ...sx,
      }}
    >
      <Typography align="center" variant="body1" color="white">
        {message}
      </Typography>
      <Typography align="center" variant="caption" color="white">
        {data}
      </Typography>
    </Box>
  );
};

export default ErrorContent;

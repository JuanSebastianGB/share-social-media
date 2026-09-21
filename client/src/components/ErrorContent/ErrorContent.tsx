import { Box, Typography, useTheme } from '@mui/material';
import React from 'react';
export interface Props {
  message?: string;
  data?: string;
  sx?: object;
}

const looksTechnical = (value?: string): boolean => {
  if (!value) return true;
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (/^[A-Z0-9_]+$/.test(trimmed)) return true;
  if (/^ERROR[_-]/.test(trimmed)) return true;
  if (/^[{\[]/.test(trimmed)) return true;
  return false;
};

const ErrorContent: React.FC<Props> = ({
  message = 'Something went wrong.',
  data,
  sx,
}) => {
  const theme = useTheme();
  const showData = typeof data === 'string' && !looksTechnical(data);

  return (
    <Box
      sx={{
        minHeight: '200px',
        bgcolor: theme.palette.background.paper,
        width: '50%',
        margin: '2rem auto',
        padding: '1rem',
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '0.5rem',
        flex: 0.5,
        ...sx,
      }}
    >
      <Typography align="center" variant="body1" color="error">
        {message}
      </Typography>
      {showData && (
        <Typography
          align="center"
          variant="caption"
          color={theme.palette.neutral.main}
        >
          {data}
        </Typography>
      )}
    </Box>
  );
};

export default ErrorContent;

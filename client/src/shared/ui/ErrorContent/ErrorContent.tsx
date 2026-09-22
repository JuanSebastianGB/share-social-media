import { Box, Button, Typography, useTheme } from '@mui/material';
import React from 'react';

export interface Props {
  message?: string;
  data?: string;
  sx?: object;
  onRetry?: () => void;
  retryLabel?: string;
}

const looksTechnical = (value?: string): boolean => {
  if (!value) return true;
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (/^[A-Z0-9_]+$/.test(trimmed)) return true;
  if (/^ERROR[_-]/.test(trimmed)) return true;
  if (/^[[{]/.test(trimmed)) return true;
  return false;
};

const humanMessage = (message?: string, data?: string): string => {
  if (message && !looksTechnical(message)) return message;
  if (data && !looksTechnical(data)) return data;
  return 'Something went wrong. Please try again.';
};

const ErrorContent: React.FC<Props> = ({
  message,
  data,
  sx,
  onRetry,
  retryLabel = 'Try again',
}) => {
  const theme = useTheme();
  const displayMessage = humanMessage(message, data);
  const showData =
    typeof data === 'string' &&
    !looksTechnical(data) &&
    data.trim() !== displayMessage;
  const handleRetry = onRetry ?? (() => window.location.reload());

  return (
    <Box
      role="alert"
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
        alignItems: 'center',
        gap: '0.75rem',
        flex: 0.5,
        ...sx,
      }}
    >
      <Typography align="center" variant="body1" color="error">
        {displayMessage}
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
      <Button variant="contained" color="primary" onClick={handleRetry}>
        {retryLabel}
      </Button>
    </Box>
  );
};

export default ErrorContent;

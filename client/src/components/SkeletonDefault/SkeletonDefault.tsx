import { Box, Skeleton, useMediaQuery } from '@mui/material';
import React from 'react';
export interface Props {}

const SkeletonDefault: React.FC<Props> = () => {
  const isMobileScreen = useMediaQuery('(max-width : 800px)');
  return (
    <Box
      sx={{
        maxWidth: '1000px',
        margin: '0 auto',
        minHeight: '100vh',
        padding: '1rem',
        display: 'grid',
        gridTemplateColumns: isMobileScreen ? '1fr' : 'repeat(3, 1fr)',
        gap: '1rem',
      }}
    >
      <Skeleton
        variant="rectangular"
        width="100%"
        height="100%"
        sx={{ gridColumn: 'span 3', gridRow: '1/2' }}
      />
      <Skeleton
        variant="rounded"
        width="100%"
        height="100%"
        sx={{ gridRow: 'span 3' }}
      />
      <Skeleton
        variant="rounded"
        height="100%"
        sx={{ gridColumn: 'span 2', gridRow: 'span 2' }}
      />
      <Skeleton variant="rounded" height="100%" sx={{ gridColumn: 'span 2' }} />
    </Box>
  );
};

export default SkeletonDefault;

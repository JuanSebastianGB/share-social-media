import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { Box, useTheme } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import React, { useEffect, useState } from 'react';
export interface Props {
  showBelow?: number;
}

const Scroll: React.FC<Props> = ({ showBelow = 300 }) => {
  const theme = useTheme();
  const [show, setShow] = useState(false);
  const handleClick = () => {
    window['scrollTo']({ top: 0, behavior: 'smooth' });
  };
  const handleScroll = () => {
    if (window.pageYOffset > showBelow) {
      if (!show) setShow(true);
    } else {
      if (show) setShow(false);
    }
  };

  useEffect(() => {
    if (showBelow) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  if (!show) return null;

  return (
    <Box>
      <IconButton
        sx={{
          position: 'fixed',
          right: '2%',
          bottom: '2vh',
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.neutral.dark,
          '&:hover, &.MuiFocusVisible': {
            transition: '0.3s',
            color: theme.palette.primary.main,
            backgroundColor: theme.palette.background.paper,
          },
        }}
        aria-label="Back to top"
        onClick={handleClick}
      >
        <ArrowUpwardIcon />
      </IconButton>
    </Box>
  );
};

export default Scroll;

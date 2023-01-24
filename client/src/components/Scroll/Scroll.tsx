import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { Box } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import React, { useEffect, useState } from 'react';
export interface Props {
  showBelow?: number;
}

const Scroll: React.FC<Props> = ({ showBelow = 300 }) => {
  const [show, setShow] = useState(!!showBelow);
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
  return (
    <Box>
      <IconButton
        sx={{
          position: 'fixed',
          right: '2%',
          bottom: '2vh',
          backgroundColor: '#DCDCDC',
          color: 'black',
          '&:hover, &.MuiFocusVisible': {
            transition: '0.3s',
            color: '#397ba6',
            backgroundColor: '#DCDCDC',
          },
        }}
        aria-label="up"
        onClick={handleClick}
      >
        <ArrowUpwardIcon />
      </IconButton>
    </Box>
  );
};

export default Scroll;

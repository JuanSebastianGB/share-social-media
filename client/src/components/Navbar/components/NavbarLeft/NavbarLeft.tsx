import { Search } from '@mui/icons-material';
import {
  IconButton,
  InputBase,
  Typography,
  useMediaQuery,
} from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StyledFlexBetween } from '../../styled-components';

export interface Props {}

const NavbarLeft: React.FC<Props> = () => {
  const isMobileScreen = useMediaQuery('(max-width: 800px)');

  const navigate = useNavigate();
  return (
    <StyledFlexBetween sx={{ gap: '2rem' }}>
      <Typography
        fontWeight="bold"
        fontSize="clamp(1rem, 2rem, 2.25rem)"
        color="whitesmoke"
        onClick={() => navigate('/home')}
        sx={{
          '&:hover': {
            color: 'lightblue',
            cursor: 'pointer',
          },
        }}
      >
        S. Social M.
      </Typography>
      {!isMobileScreen && (
        <StyledFlexBetween>
          <InputBase
            placeholder="search..."
            sx={{
              color: '#818081',
              backgroundColor: '#2e2d2e',
              p: '0 0.5rem',
              borderRadius: '0.5rem',
            }}
          />
          <IconButton>
            <Search sx={{ color: '#818081' }} />
          </IconButton>
        </StyledFlexBetween>
      )}
    </StyledFlexBetween>
  );
};

export default NavbarLeft;

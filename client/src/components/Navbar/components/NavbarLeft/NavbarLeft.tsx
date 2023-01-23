import { Search } from '@mui/icons-material';
import { IconButton, InputBase, Typography, useTheme } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StyledFlexBetween } from '../../styled-components';

export interface Props {
  isMobileScreen: boolean;
}

const NavbarLeft: React.FC<Props> = ({ isMobileScreen }) => {
  const theme = useTheme();

  const navigate = useNavigate();
  return (
    <StyledFlexBetween sx={{ gap: '2rem' }}>
      <Typography
        fontWeight="bold"
        fontSize="clamp(1rem, 2rem, 2.25rem)"
        color={theme.palette.primary.dark}
        onClick={() => navigate('/home')}
        sx={{
          '&:hover': {
            color: theme.palette.primary.light,
            cursor: 'pointer',
          },
          whiteSpace: 'nowrap',
        }}
      >
        S. Social M.
      </Typography>
      {!isMobileScreen && (
        <StyledFlexBetween>
          <InputBase
            placeholder="search..."
            sx={{
              color: theme.palette.neutral.dark,
              backgroundColor: theme.palette.background.default,
              p: '0 0.5rem',
              borderRadius: '0.5rem',
            }}
          />
          <IconButton>
            <Search sx={{ color: theme.palette.neutral.dark }} />
          </IconButton>
        </StyledFlexBetween>
      )}
    </StyledFlexBetween>
  );
};

export default NavbarLeft;

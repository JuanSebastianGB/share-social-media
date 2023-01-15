import { useMediaQuery, useTheme } from '@mui/material';
import React, { useState } from 'react';
import { NavbarLeft, NavbarMenu, NavbarRight } from './components';
import { StyledFlexBetween } from './styled-components';

export interface NavbarInterface {}

const Navbar: React.FC<NavbarInterface> = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobileScreen = useMediaQuery('(max-width: 800px)');
  const theme = useTheme();

  return (
    <StyledFlexBetween
      sx={{
        bgcolor: theme.palette.background.paper,
        padding: '0.2rem',
      }}
    >
      <NavbarLeft />
      <NavbarRight setMenuOpen={setMenuOpen} menuOpen={menuOpen} />
      {isMobileScreen && menuOpen && <NavbarMenu setMenuOpen={setMenuOpen} />}
    </StyledFlexBetween>
  );
};

export default Navbar;

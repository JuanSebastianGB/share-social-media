import { AppStore } from '@/models';
import { makeLogout } from '@/redux/states/authSlice';
import { toggleMode } from '@/redux/states/themeSlice';
import { DarkMode, LightMode, Menu } from '@mui/icons-material';
import {
  FormControl,
  IconButton,
  InputBase,
  MenuItem,
  Select,
  useTheme,
} from '@mui/material';
import React, { Dispatch, Fragment, SetStateAction } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyledFlexBetween } from '../../styled-components';
export interface NavbarRightInterface {
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
  menuOpen: boolean;
  isMobileScreen: boolean;
}

const NavbarRight: React.FC<NavbarRightInterface> = ({
  setMenuOpen,
  menuOpen,
  isMobileScreen,
}) => {
  const handleLogout = () => {
    dispatch(makeLogout({}));
  };
  const mode = useSelector((store: AppStore) => store.theme?.mode);
  const user = useSelector((store: AppStore) => store.auth?.user);
  const dispatch = useDispatch();
  const theme = useTheme();

  if (isMobileScreen)
    return (
      <Fragment>
        <IconButton
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu className="icon" />
        </IconButton>
      </Fragment>
    );
  return (
    <StyledFlexBetween sx={{ gap: '3rem' }}>
      <IconButton
        aria-label={
          mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
        }
        onClick={() => dispatch(toggleMode({ mode }))}
      >
        {mode === 'dark' ? (
          <DarkMode fontSize="small" />
        ) : (
          <LightMode
            fontSize="small"
            sx={{ color: theme.palette.neutral.dark }}
          />
        )}
      </IconButton>
      <FormControl>
        <Select
          value={user.name}
          displayEmpty
          inputProps={{ 'aria-label': 'Account menu' }}
          sx={{
            backgroundColor: theme.palette.neutral.light,
            width: '150px',
            borderRadius: '5px',
            p: '0.25rem 1rem',
            '& .MuiSvgIcon-root': {
              pr: '0.25rem',
              width: '3rem',
            },
            '& .MuiMenuItem-root': {
              backgroundColor: theme.palette.neutral.light,
            },
            '& .MuiSelect-select:focus': {
              backgroundColor: theme.palette.neutral.light,
            },
          }}
          input={<InputBase />}
        >
          <MenuItem value={user.name}>
            <small>{user.name}</small>
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <small>Log out</small>
          </MenuItem>
        </Select>
      </FormControl>
    </StyledFlexBetween>
  );
};

export default NavbarRight;

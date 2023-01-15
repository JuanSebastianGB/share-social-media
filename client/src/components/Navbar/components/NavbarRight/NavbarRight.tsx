import { AppStore } from '@/models';
import { makeLogout, toggleMode } from '@/redux/states/authSlice';
import {
  DarkMode,
  Help,
  LightMode,
  Menu,
  Message,
  Notifications,
} from '@mui/icons-material';
import {
  FormControl,
  IconButton,
  InputBase,
  MenuItem,
  Select,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { Dispatch, Fragment, SetStateAction } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyledFlexBetween } from '../../styled-components';
export interface NavbarRightInterface {
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
  menuOpen: boolean;
}

const NavbarRight: React.FC<NavbarRightInterface> = ({
  setMenuOpen,
  menuOpen,
}) => {
  const handleLogout = () => {
    dispatch(makeLogout({}));
  };
  const mode = useSelector((store: AppStore) => store.auth?.mode);
  const user = useSelector((store: AppStore) => store.auth?.user);
  const dispatch = useDispatch();
  const isMobileScreen = useMediaQuery('(max-width: 1000px)');
  const theme = useTheme();

  if (isMobileScreen)
    return (
      <Fragment>
        <IconButton onClick={() => setMenuOpen(!menuOpen)}>
          <Menu className="icon" />
        </IconButton>
      </Fragment>
    );
  return (
    <StyledFlexBetween sx={{ gap: '3rem' }}>
      <IconButton
        onClick={() => dispatch(toggleMode({ mode }))}
        sx={{ fontSize: '25px' }}
      >
        {mode === 'dark' ? (
          <DarkMode sx={{ fontSize: '25px' }} />
        ) : (
          <LightMode
            sx={{ color: theme.palette.neutral.dark, fontSize: '25px' }}
          />
        )}
      </IconButton>
      <Message className="icon" />
      <Help className="icon" />
      <Notifications className="icon" />
      <FormControl>
        <Select
          value={user.name}
          displayEmpty
          sx={{
            backgroundColor: theme.palette.neutral.light,
            width: '150px',
            borderRadius: '0.25rem',
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
            <small>Log Out</small>
          </MenuItem>
        </Select>
      </FormControl>
    </StyledFlexBetween>
  );
};

export default NavbarRight;

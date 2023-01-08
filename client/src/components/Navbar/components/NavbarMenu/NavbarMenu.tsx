import { AppStore } from '@/models';
import { makeLogout, toggleMode } from '@/redux/states/authSlice';
import {
  Close,
  DarkMode,
  Help,
  LightMode,
  Message,
  Notifications,
} from '@mui/icons-material';
import {
  Box,
  FormControl,
  IconButton,
  InputBase,
  MenuItem,
  Select,
} from '@mui/material';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyledFlexBetween } from '../../styled-components';
export interface Props {
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const NavbarMenu: React.FC<Props> = ({ setMenuOpen }) => {
  const mode = useSelector((store: AppStore) => store.auth?.mode);
  const user = useSelector((store: AppStore) => store.auth?.user);
  const dispatch = useDispatch();
  return (
    <Box
      sx={{
        position: 'fixed',
        right: 0,
        bottom: 0,
        height: '100%',
        zIndex: 10,
        maxWidth: '500px',
        minWidth: '300px',
        backgroundColor: '#1b191b',
      }}
    >
      <Box display="flex" justifyContent="flex-end" p="1rem">
        <IconButton onClick={() => setMenuOpen((prev) => !prev)}>
          <Close />
        </IconButton>
      </Box>

      <StyledFlexBetween
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        gap="3rem"
      >
        <IconButton
          onClick={() => dispatch(toggleMode({ mode }))}
          sx={{ fontSize: '25px' }}
        >
          {mode === 'dark' ? (
            <DarkMode sx={{ fontSize: '25px' }} />
          ) : (
            <LightMode sx={{ color: 'lightcyan', fontSize: '25px' }} />
          )}
        </IconButton>
        <Message className="icon" />
        <Notifications className="icon" />
        <Help className="icon" />
        <FormControl sx={{ width: '100%', alignItems: 'center' }}>
          <Select
            value={user.email}
            sx={{
              backgroundColor: '#2e2d2e',
              color: 'whitesmoke',
              width: '80%',
              borderRadius: '0.25rem',
              p: '0.25rem 1rem',
              '& .MuiSvgIcon-root': {
                pr: '0.25rem',
                width: '3rem',
              },
              '& .MuiSelect-select:focus': {
                backgroundColor: '#2e2d2e',
              },
            }}
            input={<InputBase />}
          >
            <MenuItem value={user.email}>
              <small>{user.email}</small>
            </MenuItem>
            <MenuItem onClick={() => dispatch(makeLogout({}))}>
              <small>Log Out</small>
            </MenuItem>
          </Select>
        </FormControl>
      </StyledFlexBetween>
    </Box>
  );
};

export default NavbarMenu;

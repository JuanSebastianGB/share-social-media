import { AppStore } from '@/models';
import { makeLogout } from '@/redux/states/authSlice';
import { toggleMode } from '@/redux/states/themeSlice';
import { Close, DarkMode, LightMode } from '@mui/icons-material';
import {
  Box,
  FormControl,
  IconButton,
  InputBase,
  MenuItem,
  Select,
  useTheme,
} from '@mui/material';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyledFlexBetween } from '../../styled-components';

export interface Props {
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const NavbarMenu: React.FC<Props> = ({ setMenuOpen }) => {
  const mode = useSelector((store: AppStore) => store.theme?.mode);
  const user = useSelector((store: AppStore) => store.auth?.user);
  const dispatch = useDispatch();
  const theme = useTheme();
  const accountLabel = user?.name || user?.email || '';

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        right: 0,
        height: 'auto',
        maxHeight: 'min(100%, 420px)',
        zIndex: 10,
        maxWidth: '500px',
        minWidth: '280px',
        padding: '0.75rem 1rem 1.25rem',
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.neutral.medium}`,
        borderRadius: '0 0 0 10px',
      }}
    >
      <Box display="flex" justifyContent="flex-end" pb="0.5rem">
        <IconButton
          aria-label="Close menu"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <Close />
        </IconButton>
      </Box>

      <StyledFlexBetween
        display="flex"
        flexDirection="column"
        justifyContent="flex-start"
        alignItems="stretch"
        gap="1.25rem"
      >
        <IconButton
          aria-label={
            mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
          }
          onClick={() => dispatch(toggleMode({ mode }))}
          sx={{ alignSelf: 'flex-end' }}
        >
          {mode === 'dark' ? (
            <DarkMode fontSize="small" />
          ) : (
            <LightMode fontSize="small" />
          )}
        </IconButton>
        <FormControl sx={{ width: '100%' }}>
          <Select
            value={accountLabel}
            displayEmpty
            inputProps={{ 'aria-label': 'Account menu' }}
            sx={{
              backgroundColor: theme.palette.background.default,
              color: theme.palette.neutral.dark,
              width: '100%',
              borderRadius: '5px',
              p: '0.25rem 1rem',
              '& .MuiSvgIcon-root': {
                pr: '0.25rem',
                width: '3rem',
              },
              '& .MuiSelect-select:focus': {
                backgroundColor: theme.palette.background.default,
              },
            }}
            input={<InputBase />}
          >
            <MenuItem value={accountLabel}>
              <small>{accountLabel}</small>
            </MenuItem>
            <MenuItem onClick={() => dispatch(makeLogout({}))}>
              <small>Log out</small>
            </MenuItem>
          </Select>
        </FormControl>
      </StyledFlexBetween>
    </Box>
  );
};

export default NavbarMenu;

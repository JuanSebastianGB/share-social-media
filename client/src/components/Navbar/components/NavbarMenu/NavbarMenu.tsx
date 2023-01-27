import { AppStore } from '@/models';
import { makeLogout, searchPosts, toggleMode } from '@/redux/states/authSlice';
import {
  Close,
  DarkMode,
  Help,
  LightMode,
  Message,
  Notifications,
  Search,
} from '@mui/icons-material';
import {
  Box,
  FormControl,
  IconButton,
  InputBase,
  MenuItem,
  Select,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { StyledFlexBetween } from '../../styled-components';

export interface Props {
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const NavbarMenu: React.FC<Props> = ({ setMenuOpen }) => {
  const mode = useSelector((store: AppStore) => store.auth?.mode);
  const user = useSelector((store: AppStore) => store.auth?.user);
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobileScreen = useMediaQuery('(max-width: 900px)');
  const { search: param } = useSelector((store: AppStore) => store.auth);
  const [search, setSearch] = useState<string>(param);
  const { id } = useParams();

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
        backgroundColor: theme.palette.background.paper,
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
        {isMobileScreen && (
          <StyledFlexBetween>
            <InputBase
              placeholder="search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{
                color: theme.palette.neutral.dark,
                backgroundColor: theme.palette.background.default,
                p: '0 0.5rem',
                borderRadius: '0.5rem',
              }}
            />
            <IconButton
              onClick={() => {
                !id && dispatch(searchPosts(search));
                setMenuOpen(false);
              }}
            >
              <Search sx={{ color: theme.palette.neutral.dark }} />
            </IconButton>
          </StyledFlexBetween>
        )}
        <IconButton
          onClick={() => dispatch(toggleMode({ mode }))}
          sx={{ fontSize: '25px' }}
        >
          {mode === 'dark' ? (
            <DarkMode sx={{ fontSize: '25px' }} />
          ) : (
            <LightMode sx={{ fontSize: '25px' }} />
          )}
        </IconButton>
        <Message className="icon" />
        <Notifications className="icon" />
        <Help className="icon" />
        <FormControl sx={{ width: '100%', alignItems: 'center' }}>
          <Select
            value={user.email}
            sx={{
              backgroundColor: theme.palette.background.default,
              color: 'whitesmoke',
              width: '80%',
              borderRadius: '0.25rem',
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

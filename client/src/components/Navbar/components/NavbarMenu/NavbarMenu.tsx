import { AppStore } from '@/models';
import { makeLogout } from '@/redux/states/authSlice';
import { searchPosts } from '@/redux/states/postsSlice';
import { toggleMode } from '@/redux/states/themeSlice';
import { Close, DarkMode, LightMode, Search } from '@mui/icons-material';
import {
  Box,
  FormControl,
  IconButton,
  InputBase,
  MenuItem,
  Select,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { StyledFlexBetween } from '../../styled-components';

export interface Props {
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const NavbarMenu: React.FC<Props> = ({ setMenuOpen }) => {
  const mode = useSelector((store: AppStore) => store.theme?.mode);
  const user = useSelector((store: AppStore) => store.auth?.user);
  const dispatch = useDispatch();
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobileScreen = useMediaQuery('(max-width: 900px)');
  const { search: param } = useSelector((store: AppStore) => store.posts);
  const [search, setSearch] = useState<string>(param);
  const { id } = useParams();
  const onProfile = !!id;
  const accountLabel = user?.name || user?.email || '';

  const handleSearch = () => {
    if (onProfile) {
      navigate('/home');
    }
    dispatch(searchPosts(search));
    setMenuOpen(false);
  };

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
        justifyContent="center"
        alignItems="center"
        gap="3rem"
      >
        {isMobileScreen && (
          <Box sx={{ width: '80%' }}>
            <StyledFlexBetween>
              <InputBase
                placeholder="Search posts…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                inputProps={{ 'aria-label': 'Search posts' }}
                sx={{
                  color: theme.palette.neutral.dark,
                  backgroundColor: theme.palette.background.default,
                  p: '0 0.5rem',
                  borderRadius: '10px',
                  flex: 1,
                }}
              />
              <IconButton
                aria-label={
                  onProfile ? 'Search posts on Home' : 'Search posts'
                }
                title={
                  onProfile
                    ? 'Opens Home and searches your feed'
                    : 'Search posts'
                }
                onClick={handleSearch}
              >
                <Search sx={{ color: theme.palette.neutral.dark }} />
              </IconButton>
            </StyledFlexBetween>
            {onProfile && (
              <Typography
                variant="caption"
                color={theme.palette.neutral.main}
                sx={{ display: 'block', mt: '0.25rem' }}
              >
                Search runs on Home
              </Typography>
            )}
          </Box>
        )}
        <IconButton
          aria-label={
            mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
          }
          onClick={() => dispatch(toggleMode({ mode }))}
        >
          {mode === 'dark' ? (
            <DarkMode fontSize="small" />
          ) : (
            <LightMode fontSize="small" />
          )}
        </IconButton>
        <FormControl sx={{ width: '100%', alignItems: 'center' }}>
          <Select
            value={accountLabel}
            displayEmpty
            inputProps={{ 'aria-label': 'Account menu' }}
            sx={{
              backgroundColor: theme.palette.background.default,
              color: theme.palette.neutral.dark,
              width: '80%',
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

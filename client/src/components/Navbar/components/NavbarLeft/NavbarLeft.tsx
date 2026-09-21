import { AppStore } from '@/models';
import { searchPosts } from '@/redux/states/postsSlice';
import { Search } from '@mui/icons-material';
import { Box, IconButton, InputBase, Typography, useTheme } from '@mui/material';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { StyledFlexBetween } from '../../styled-components';

export interface Props {
  isMobileScreen: boolean;
}

const NavbarLeft: React.FC<Props> = ({ isMobileScreen }) => {
  const theme = useTheme();
  const { search: param } = useSelector((store: AppStore) => store.posts);
  const [search, setSearch] = useState<string>(param);
  const dispatch = useDispatch();
  const { id } = useParams();
  const navigate = useNavigate();
  const onProfile = !!id;

  const handleSearch = () => {
    if (onProfile) {
      navigate('/home');
    }
    dispatch(searchPosts(search));
  };

  return (
    <StyledFlexBetween sx={{ gap: '2rem' }}>
      <Typography
        variant="h5"
        fontWeight="bold"
        color={theme.palette.primary.dark}
        onClick={() => navigate('/home')}
        role="link"
        tabIndex={0}
        aria-label="Share Social Media"
        title="Share Social Media"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            navigate('/home');
          }
        }}
        sx={{
          '&:hover': {
            color: theme.palette.primary.light,
            cursor: 'pointer',
          },
          whiteSpace: 'nowrap',
        }}
      >
        S.S.Media
      </Typography>
      {!isMobileScreen && (
        <Box>
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
              sx={{ display: 'block', mt: '0.25rem', pl: '0.5rem' }}
            >
              Search runs on Home
            </Typography>
          )}
        </Box>
      )}
    </StyledFlexBetween>
  );
};

export default NavbarLeft;

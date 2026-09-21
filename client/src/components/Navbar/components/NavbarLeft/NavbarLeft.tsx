import { AppStore } from '@/models';
import { searchPosts } from '@/redux/states/postsSlice';
import { Search } from '@mui/icons-material';
import { IconButton, InputBase, Typography, useTheme } from '@mui/material';
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
  return (
    <StyledFlexBetween sx={{ gap: '2rem' }}>
      <Typography
        variant="h5"
        fontWeight="bold"
        color={theme.palette.primary.dark}
        onClick={() => navigate('/home')}
        aria-label="Share Social Media"
        title="Share Social Media"
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
        <StyledFlexBetween>
          <InputBase
            placeholder="Search posts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              color: theme.palette.neutral.dark,
              backgroundColor: theme.palette.background.default,
              p: '0 0.5rem',
              borderRadius: '10px',
            }}
          />
          <IconButton onClick={() => !id && dispatch(searchPosts(search))}>
            <Search sx={{ color: theme.palette.neutral.dark }} />
          </IconButton>
        </StyledFlexBetween>
      )}
    </StyledFlexBetween>
  );
};

export default NavbarLeft;

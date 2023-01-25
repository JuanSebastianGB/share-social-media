import { AppStore } from '@/models';
import { searchPosts } from '@/redux/states/authSlice';
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
  const { search: param } = useSelector((store: AppStore) => store.auth);
  const [search, setSearch] = useState<string>(param);
  const dispatch = useDispatch();
  const { id } = useParams();

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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              color: theme.palette.neutral.dark,
              backgroundColor: theme.palette.background.default,
              p: '0 0.5rem',
              borderRadius: '0.5rem',
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

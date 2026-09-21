import {
  AddPost,
  ErrorContent,
  Friends,
  Navbar,
  Posts,
  SkeletonDefault,
  Spinner,
  UserInfo,
} from '@/components';
import { useUser } from '@/hooks';
import { makeLogout } from '@/redux/states/authSlice';
import { setPosts } from '@/redux/states/postsSlice';
import { StyledSection } from '@/styled-components';
import { Box, Button, Typography, useMediaQuery, useTheme } from '@mui/material';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { HomeProvider } from './context';
import HomeContainer from './Homelayout';
export interface Props {
  id: string;
}

const Home: React.FC<Props> = ({ id }) => {
  const { error, isError, loading, user } = useUser(id);
  const isMobileScreen = useMediaQuery('(max-width: 900px)');
  const theme = useTheme();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // @ts-ignore
    if (error?.error?.response.data === 'ERROR_GET_USER') {
      dispatch(makeLogout({}));
      navigate('/');
    }

    dispatch(setPosts({ posts: [] }));
  }, []);

  if (loading) return <Spinner />;
  if (isError)
    return (
      <ErrorContent
        // @ts-ignore
        message={error?.error?.message}
        // @ts-ignore
        data={error?.error?.response.data}
      />
    );

  if (user)
    return (
      <HomeProvider>
        <Navbar />
        <HomeContainer>
          <section>
            <StyledSection
              sx={
                isMobileScreen
                  ? { width: '100%', minWidth: 0 }
                  : { flex: 2.2, minWidth: 0 }
              }
            >
              {isMobileScreen && (
                <Box
                  sx={{
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    mb: '0.75rem',
                  }}
                >
                  <Button
                    size="small"
                    onClick={() => navigate(`/profile/${user._id}`)}
                    sx={{
                      color: theme.palette.primary.main,
                      fontWeight: 700,
                      textTransform: 'none',
                      padding: 0,
                      minWidth: 0,
                      justifyContent: 'flex-start',
                    }}
                  >
                    Your profile & friends
                  </Button>
                  <Typography
                    variant="caption"
                    color={theme.palette.neutral.main}
                    display="block"
                    sx={{ mt: '0.25rem' }}
                  >
                    Profile, friends, and your posts live here.
                  </Typography>
                </Box>
              )}
              <AddPost user={user} />
              <Posts />
            </StyledSection>
            {!isMobileScreen && (
              <StyledSection
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 0.85,
                  maxWidth: 320,
                  width: '100%',
                  gap: '1rem',
                }}
              >
                <UserInfo user={user} />
                {!!user && <Friends user={user} />}
              </StyledSection>
            )}
          </section>
        </HomeContainer>
      </HomeProvider>
    );
  return <SkeletonDefault />;
};

export default Home;

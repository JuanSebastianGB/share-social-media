import { AddPost, Friends, Navbar, Posts, UserInfo } from '@/components';
import { Box, styled } from '@mui/material';
import React, { Fragment } from 'react';
export interface Props {}

const StyledHome = styled(Box)(({ theme }) => ({
  width: '100%',
  background: theme.palette.background.default,
  minHeight: '100vh',
  '& section': {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    maxWidth: '85%',
    margin: '0 auto',
    gap: '1rem',
  },
  [theme.breakpoints.down('sm')]: {
    '& section': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexDirection: 'column',
      maxWidth: '93%',
      margin: '0 auto',
      gap: null,
    },
  },
}));

const StyledSection = styled(Box)(({ theme }) => ({
  borderRadius: '10px',
  padding: '1rem',
  margin: '1rem 0',
  width: '100%',
  background: theme.palette.background.paper,
}));

const Home: React.FC<Props> = () => {
  return (
    <Fragment>
      <Navbar />
      <StyledHome>
        <section>
          <StyledSection>
            <UserInfo />
          </StyledSection>
          <StyledSection>
            <AddPost />
            <Posts />
          </StyledSection>
          <StyledSection>
            <div>Publicity</div>
            <Friends />
          </StyledSection>
        </section>
      </StyledHome>
    </Fragment>
  );
};

export default Home;

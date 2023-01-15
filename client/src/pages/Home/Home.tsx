import { AddPost, Friends, Navbar, Posts, UserInfo } from '@/components';
import { Box, styled } from '@mui/material';
import React from 'react';
import { HomeProvider } from './context';
import HomeContainer from './Homelayout';
export interface Props {}

const StyledSection = styled(Box)(({ theme }) => ({
  borderRadius: '10px',
  padding: '1rem',
  width: '100%',
  // background: theme.palette.background.paper,
}));

const Home: React.FC<Props> = () => {
  return (
    <HomeProvider>
      <Navbar />
      <HomeContainer>
        <section>
          <StyledSection sx={{ flex: 0.5 }}>
            <UserInfo />
          </StyledSection>
          <StyledSection sx={{ flex: 1.1 }}>
            <AddPost />
            <Posts />
          </StyledSection>
          <StyledSection sx={{ flex: 0.4 }}>
            <div>Publicity</div>
            <Friends />
          </StyledSection>
        </section>
      </HomeContainer>
    </HomeProvider>
  );
};

export default Home;

import { AddPost, Friends, Navbar, Posts, UserInfo } from '@/components';
import { AppStore } from '@/models';
import { Box, styled } from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';
import { HomeProvider } from './context';
import HomeContainer from './Homelayout';
export interface Props {}

const StyledSection = styled(Box)(({ theme }) => ({
  borderRadius: '10px',
  padding: '0.2rem',
  width: '100%',
  // background: theme.palette.background.paper,
}));

const Home: React.FC<Props> = () => {
  const { id } = useSelector((store: AppStore) => store.auth.user);
  return (
    <HomeProvider>
      <Navbar />
      <HomeContainer>
        <section>
          <StyledSection sx={{ flex: 0.6 }}>
            <UserInfo />
          </StyledSection>
          <StyledSection sx={{ flex: 1 }}>
            <AddPost />
            <Posts />
          </StyledSection>
          <StyledSection sx={{ flex: 0.4 }}>
            <div>Publicity</div>
            <Friends id={id} />
          </StyledSection>
        </section>
      </HomeContainer>
    </HomeProvider>
  );
};

export default Home;

import { AddPost, Friends, Navbar, Posts, UserInfo } from '@/components';
import { AppStore } from '@/models';
import { StyledSection } from '@/styled-components';
import { Skeleton, Stack } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { HomeProvider } from './context';
import HomeContainer from './Homelayout';
export interface Props {}

const Home: React.FC<Props> = () => {
  const { id } = useSelector((store: AppStore) => store.auth.user);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    (() => {
      setUserId(id);
    })();
  }, [userId]);

  if (!!userId)
    return (
      <HomeProvider>
        <Navbar />
        <HomeContainer>
          <section>
            <StyledSection sx={{ flex: 0.6 }}>
              <UserInfo id={userId} />
            </StyledSection>
            <StyledSection sx={{ flex: 1 }}>
              <AddPost id={userId} />
              <Posts />
            </StyledSection>
            <StyledSection sx={{ flex: 0.4 }}>
              <div>Publicity</div>
              <Friends id={userId} />
            </StyledSection>
          </section>
        </HomeContainer>
      </HomeProvider>
    );
  return (
    <Stack spacing={1}>
      <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
      <Skeleton variant="circular" width={40} height={40} />
      <Skeleton variant="rectangular" width="100%" height={120} />
      <Skeleton variant="rounded" width="100%" height={120} />
    </Stack>
  );
};

export default Home;

import {
  AddPost,
  Friends,
  Navbar,
  Posts,
  Spinner,
  UserInfo,
} from '@/components';
import { useUser } from '@/hooks';
import { AppStore } from '@/models';
import { StyledSection } from '@/styled-components';
import React from 'react';
import { useSelector } from 'react-redux';
import { HomeProvider } from './context';
import HomeContainer from './Homelayout';
export interface Props {}

const Home: React.FC<Props> = () => {
  const { id } = useSelector((store: AppStore) => store.auth.user);
  const { error, isError, loading, user } = useUser(id);

  if (isError)
    return (
      <>
        something went wrong
        {JSON.stringify(error)}
      </>
    );
  if (loading) return <Spinner />;

  if (user?._id)
    return (
      <HomeProvider>
        <Navbar />
        <HomeContainer>
          <section>
            <StyledSection sx={{ flex: 0.6 }}>
              <UserInfo user={user} />
            </StyledSection>
            <StyledSection sx={{ flex: 1 }}>
              <AddPost user={user} />
              <Posts />
            </StyledSection>
            <StyledSection sx={{ flex: 0.4 }}>
              <div>Publicity</div>
              <Friends user={user} />
            </StyledSection>
          </section>
        </HomeContainer>
      </HomeProvider>
    );
  return null;
};

export default Home;

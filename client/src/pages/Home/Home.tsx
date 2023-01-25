import {
  AddPost,
  ErrorContent,
  Friends,
  Navbar,
  Posts,
  SkeletonDefault,
  Spinner,
  Trends,
  UserInfo,
} from '@/components';
import { useUser } from '@/hooks';
import { AppStore } from '@/models';
import { makeLogout, setPosts } from '@/redux/states/authSlice';
import { StyledSection } from '@/styled-components';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { HomeProvider } from './context';
import HomeContainer from './Homelayout';
export interface Props {}

const Home: React.FC<Props> = () => {
  const { id } = useSelector((store: AppStore) => store.auth.user);
  const { error, isError, loading, user } = useUser(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // @ts-ignore
  if (error?.error?.response.data === 'ERROR_GET_USER') {
    dispatch(makeLogout({}));
    navigate('/');
  }

  dispatch(setPosts({ posts: [] }));

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
            <StyledSection sx={{ flex: 1 }}>
              <AddPost user={user} />
              <Posts />
            </StyledSection>
            <StyledSection sx={{ flex: 0.6 }}>
              <UserInfo user={user} />
            </StyledSection>
            <StyledSection sx={{ flex: 0.4, gap: '1rem' }}>
              <Trends />
              <Friends user={user} />
            </StyledSection>
          </section>
        </HomeContainer>
      </HomeProvider>
    );
  return <SkeletonDefault />;
};

export default Home;

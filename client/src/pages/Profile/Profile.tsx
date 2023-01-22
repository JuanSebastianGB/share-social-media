import {
  ErrorContent,
  Friends,
  Navbar,
  Posts,
  Spinner,
  UserInfo,
} from '@/components';
import { useUser } from '@/hooks';
import { StyledSection } from '@/styled-components';
import React from 'react';
import { useParams } from 'react-router-dom';
import ProfileLayout from './Profilelayout';
export interface ProfileInterface {}

const Profile: React.FC<ProfileInterface> = () => {
  const { id } = useParams();
  if (!id) return <></>;

  const { error, isError, loading, user } = useUser(`${id}`);

  if (isError)
    return (
      <ErrorContent
        // @ts-ignore
        data={error?.error?.response.data}
        // @ts-ignore
        message={error?.error?.message}
      />
    );

  if (loading) return <Spinner />;

  if (user?._id)
    return (
      <>
        <Navbar />
        <ProfileLayout>
          <section>
            <StyledSection sx={{ flex: 1 }}>
              <Posts id={id} isProfile />
            </StyledSection>
            <StyledSection sx={{ flex: 0.6, '& > *': { my: '10px' } }}>
              <UserInfo user={user} />
              <Friends user={user} />
            </StyledSection>
          </section>
        </ProfileLayout>
      </>
    );
  return null;
};

export default Profile;

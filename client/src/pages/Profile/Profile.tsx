import {
  ErrorContent,
  Navbar,
  SkeletonDefault,
  Spinner,
} from '@/shared/ui';
import { Posts } from '@/features/feed';
import { Friends, useFriends } from '@/features/friends';
import { UserInfo } from '@/features/profile';
import { useUser, useUserPosts } from '@/hooks';
import { StyledSection } from '@/styled-components';
import React from 'react';
import { useParams } from 'react-router-dom';
import ProfileLayout from './Profilelayout';
export interface ProfileInterface {}

const Profile: React.FC<ProfileInterface> = () => {
  const { id } = useParams();
  if (!id) return <></>;

  const { error, isError, loading, user } = useUser(`${id}`);
  const { friends } = useFriends(`${id}`);
  const { results: ownPosts } = useUserPosts(`${id}`);

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

  if (user)
    return (
      <>
        <Navbar />
        <ProfileLayout>
          <section>
            <StyledSection sx={{ flex: 0.6, '& > *': { my: '10px' } }}>
              <UserInfo
                user={user}
                friendCount={friends?.length ?? null}
                postCount={ownPosts?.length ?? null}
              />
              <Friends user={user} />
            </StyledSection>
            <StyledSection sx={{ flex: 1 }}>
              <Posts id={id} isProfile />
            </StyledSection>
          </section>
        </ProfileLayout>
      </>
    );
  return <SkeletonDefault />;
};

export default Profile;

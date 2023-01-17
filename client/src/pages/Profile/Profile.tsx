import { Friends, Navbar, Posts, UserInfo } from '@/components';
import { StyledSection } from '@/styled-components';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProfileLayout from './Profilelayout';
export interface ProfileInterface {}

const Profile: React.FC<ProfileInterface> = () => {
  const { id } = useParams();
  const [userId, setUserId] = useState<string | undefined>('');

  useEffect(() => {
    (() => {
      setUserId(id);
    })();
  }, [userId, id]);

  if (!!id)
    return (
      <>
        <Navbar />
        <ProfileLayout>
          <section>
            <StyledSection sx={{ flex: 1 }}>
              <Posts id={id} isProfile />
            </StyledSection>
            <StyledSection sx={{ flex: 0.6, '& > *': { my: '10px' } }}>
              <UserInfo id={id} />
              <Friends id={id} />
            </StyledSection>
          </section>
        </ProfileLayout>
      </>
    );
  return null;
};

export default Profile;

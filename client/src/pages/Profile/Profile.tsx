import React from 'react';
import { useParams } from 'react-router-dom';
export interface ProfileInterface {}

const Profile: React.FC<ProfileInterface> = () => {
  const { id } = useParams();
  return (
    <div>
      <h1>Profile</h1>
      <p>id: {id}</p>
    </div>
  );
};

export default Profile;

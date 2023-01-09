import { useFriends } from '@/hooks';
import React from 'react';
export interface Props {}

const Friends: React.FC<Props> = () => {
  const { data: friends } = useFriends();

  return (
    <div>
      <h1>Friends</h1>
      {friends ? JSON.stringify(friends, null, 2) : null}
    </div>
  );
};

export default Friends;

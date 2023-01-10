import { useHomeContext } from '@/pages/Home/context';
import { ErrorBoundary } from '@/utilities';
import React from 'react';
export interface Props {}

const Friends: React.FC<Props> = () => {
  const {
    friendsState: { friends },
  } = useHomeContext();

  return (
    <ErrorBoundary
      fallBackComponent={<>Error in Friends</>}
      resetCondition={friends}
    >
      <div>
        <h1>Friends</h1>
        {friends ? JSON.stringify(friends, null, 2) : null}
      </div>
    </ErrorBoundary>
  );
};

export default Friends;

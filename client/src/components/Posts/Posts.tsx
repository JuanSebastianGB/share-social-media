import { fetchPostsService } from '@/services';
import { ErrorBoundary } from '@/utilities';
import React from 'react';
import useSWR from 'swr';
export interface Props {
  isProfile?: boolean;
}

const Posts: React.FC<Props> = ({ isProfile }) => {
  const { data: posts } = useSWR('posts', fetchPostsService);
  return (
    <ErrorBoundary
      fallBackComponent={<>Error in Posts</>}
      resetCondition={posts}
    >
      <div>
        <h1>Posts</h1>
        {posts ? JSON.stringify(posts, null, 2) : null}
      </div>
    </ErrorBoundary>
  );
};

export default Posts;

import { fetchPostsService } from '@/services';
import React from 'react';
import useSWR from 'swr';
export interface Props {
  isProfile?: boolean;
}

const Posts: React.FC<Props> = ({ isProfile }) => {
  const { data: posts } = useSWR('posts', fetchPostsService);
  return (
    <div>
      <h1>Posts</h1>
      {posts ? JSON.stringify(posts, null, 2) : null}
    </div>
  );
};

export default Posts;

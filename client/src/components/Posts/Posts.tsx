import { usePosts } from '@/hooks';
import { PostApiModel, UserApiModel } from '@/models';
import { ErrorBoundary } from '@/utilities';
import React from 'react';
import Post from './Post/Post';
export interface Props {
  isProfile?: boolean;
  id?: string;
}

const Posts: React.FC<Props> = ({ isProfile = false, id }) => {
  const { friends, posts } = usePosts(isProfile, id);

  if (!!!posts) return <>Loading</>;
  return (
    <ErrorBoundary
      fallBackComponent={<>Error in Posts</>}
      resetCondition={posts}
    >
      {posts &&
        friends &&
        posts.map((post: PostApiModel) => {
          const idPostUser = post.user._id;
          const isFriend = !!friends.find(
            (friend: UserApiModel) => friend._id === idPostUser
          );
          return <Post key={post._id} isFriend={isFriend} {...post} />;
        })}
    </ErrorBoundary>
  );
};

export default Posts;

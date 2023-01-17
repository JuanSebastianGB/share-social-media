import { usePosts } from '@/hooks';
import { AppStore, PostApiModel, UserApiModel } from '@/models';
import { ErrorBoundary } from '@/utilities';
import React from 'react';
import { useSelector } from 'react-redux';
import Post from './Post/Post';
export interface Props {
  isProfile?: boolean;
}

const Posts: React.FC<Props> = ({ isProfile }) => {
  usePosts();
  const { posts, friends } = useSelector((store: AppStore) => store.auth);

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

import { PostApiModel, UserApiModel } from '@/models';
import { useHomeContext } from '@/pages/Home/context';
import { ErrorBoundary } from '@/utilities';
import React from 'react';
import Post from './Post/Post';
export interface Props {
  isProfile?: boolean;
}

const Posts: React.FC<Props> = ({ isProfile }) => {
  const {
    friendsState: { friends },
    postsState: { posts },
  } = useHomeContext();

  return (
    <ErrorBoundary
      fallBackComponent={<>Error in Posts</>}
      resetCondition={posts}
    >
      <div>
        <h1>Posts</h1>
        {posts &&
          friends &&
          posts.map((post: PostApiModel) => {
            const idPostUser = post.user._id;
            const isFriend = !!friends.find(
              (friend: UserApiModel) => friend._id === idPostUser
            );
            return <Post key={post._id} isFriend={isFriend} {...post} />;
          })}
      </div>
    </ErrorBoundary>
  );
};

export default Posts;

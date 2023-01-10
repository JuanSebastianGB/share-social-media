import { postAdapter } from '@/adapters';
import { AppStore, PostApiModel, UserApiModel } from '@/models';
import { useHomeContext } from '@/pages/Home/context';
import { fetchPostsService, fetchToggleFriendUserService } from '@/services';
import { ErrorBoundary } from '@/utilities';
import { Box, Button } from '@mui/material';
import React, { Fragment } from 'react';
import { useSelector } from 'react-redux';
import useSWR from 'swr';
export interface Props {
  isProfile?: boolean;
}

const Posts: React.FC<Props> = ({ isProfile }) => {
  const { id } = useSelector((store: AppStore) => store.auth.user);
  const { data: posts } = useSWR<PostApiModel[] | undefined>(
    'posts',
    fetchPostsService
  );
  const {
    friendsState: { mutateFriends, friends },
  } = useHomeContext();

  const handleClick = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    try {
      const { value: friendId } = e.target;
      const response = await fetchToggleFriendUserService<string>(id, friendId);
      mutateFriends();
      console.log(response);
    } catch (error) {
      console.log({ error });
    }
  };
  return (
    <ErrorBoundary
      fallBackComponent={<>Error in Posts</>}
      resetCondition={posts}
    >
      <div>
        <h1>Posts</h1>
        {posts &&
          posts.map((post) => {
            const adaptedPost = postAdapter(post);
            const { _id: userPostId } = adaptedPost?.user;

            const isFriendIncluded = friends.find(
              (friend: UserApiModel) => friend._id === userPostId
            );

            return (
              <Fragment key={adaptedPost.id}>
                <Box>PostId: {adaptedPost.id}</Box>
                <Box>User Post Id: {userPostId}</Box>
                <Box>User Post Id: {adaptedPost?.body}</Box>
                {id !== userPostId && (
                  <Button
                    value={userPostId}
                    onClick={handleClick}
                    variant="contained"
                  >
                    {isFriendIncluded ? 'Quit friend' : 'Add Friend'}
                  </Button>
                )}
              </Fragment>
            );
          })}
        {/* {posts ? JSON.stringify(posts, null, 2) : null} */}
      </div>
    </ErrorBoundary>
  );
};

export default Posts;

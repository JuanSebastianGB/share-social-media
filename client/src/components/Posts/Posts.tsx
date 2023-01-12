import { postAdapter } from '@/adapters';
import { AppStore, PostApiModel, UserApiModel } from '@/models';
import { useHomeContext } from '@/pages/Home/context';
import { fetchToggleFriendUserService } from '@/services';
import { ErrorBoundary } from '@/utilities';
import { Box, Button } from '@mui/material';
import React, { Fragment } from 'react';
import { useSelector } from 'react-redux';
export interface Props {
  isProfile?: boolean;
}

const Posts: React.FC<Props> = ({ isProfile }) => {
  const { id } = useSelector((store: AppStore) => store.auth.user);
  // const { data: posts } = useSWR<PostApiModel[] | undefined>(
  //   'posts',
  //   fetchPostsService
  // );

  const {
    friendsState: { mutateFriends, friends },
    postsState: { posts },
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
          friends &&
          posts.map((post: PostApiModel) => {
            const adaptedPost = postAdapter(post);
            const { _id: userPostId } = adaptedPost?.user;
            const isFriendIncluded = !!friends.find(
              (friend: UserApiModel) => friend._id === userPostId
            );
            return (
              <Fragment key={adaptedPost.id}>
                <img
                  className="image"
                  style={{ maxWidth: '400px', objectFit: 'cover' }}
                  src={adaptedPost.file.url}
                  alt="idea"
                />
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
      </div>
    </ErrorBoundary>
  );
};

export default Posts;

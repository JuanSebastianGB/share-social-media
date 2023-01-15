import { postAdapter } from '@/adapters';
import { AppStore, PostApiModel } from '@/models';
import { useHomeContext } from '@/pages/Home/context';
import { fetchToggleFriendUserService } from '@/services';
import { Box, Button } from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';
export interface Props extends PostApiModel {
  isFriend: boolean;
}

const Post: React.FC<Props> = ({ isFriend, ...post }) => {
  const { id } = useSelector((store: AppStore) => store.auth.user);
  const {
    friendsState: { mutateFriends },
  } = useHomeContext();
  const isOwn = id === post.user._id;

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

  const adaptedPost = postAdapter(post);
  const { user: userPost } = adaptedPost;

  return (
    <Box key={adaptedPost.id}>
      <Box
        component="img"
        className="image"
        style={{
          width: '100%',
          objectFit: 'cover',
          margin: '0 auto',
        }}
        src={adaptedPost.file.url}
        alt="idea"
      />
      <Box>PostId: {adaptedPost.id}</Box>
      <Box>User Post Id: {userPost._id}</Box>
      <Box>User adaptedPost Id: {adaptedPost?.body}</Box>
      {!isOwn && (
        <Button value={userPost._id} onClick={handleClick} variant="contained">
          {isFriend ? 'Quit friend' : 'Add Friend'}
        </Button>
      )}
    </Box>
  );
};

export default Post;

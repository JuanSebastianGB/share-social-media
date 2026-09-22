import { AppStore } from '@/models';
import { toggleFriend } from '@/redux/states/friendsSlice';
import { togglePostLikes } from '@/redux/states/postsSlice';
import { likePostService } from '../api';
import { fetchToggleFriendUserService } from '@/services/friends.service';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface UsePostInteractionsParams {
  postId: string;
  authorId: string;
  isFriend: boolean;
}

export const usePostInteractions = ({
  postId,
  authorId,
  isFriend,
}: UsePostInteractionsParams) => {
  const dispatch = useDispatch();
  const { id } = useSelector((store: AppStore) => store.auth.user);
  const [confirmUnfriendOpen, setConfirmUnfriendOpen] = useState(false);
  const [friendPending, setFriendPending] = useState(false);
  const [likePending, setLikePending] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'error' | 'success';
  }>({ open: false, message: '', severity: 'error' });

  const closeSnackbar = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));

  const toggleFriendApi = async () => {
    setFriendPending(true);
    try {
      const friends = await fetchToggleFriendUserService<string>(id, authorId);
      dispatch(toggleFriend(friends));
      setConfirmUnfriendOpen(false);
    } catch {
      setSnackbar({
        open: true,
        message: "Couldn't update friend. Please try again.",
        severity: 'error',
      });
    } finally {
      setFriendPending(false);
    }
  };

  const handleClick = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    if (isFriend) {
      setConfirmUnfriendOpen(true);
      return;
    }
    await toggleFriendApi();
  };

  const handleLike = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    setLikePending(true);
    try {
      const response = await likePostService(postId, { userId: id });
      dispatch(togglePostLikes(response));
    } catch {
      setSnackbar({
        open: true,
        message: "Couldn't update like. Please try again.",
        severity: 'error',
      });
    } finally {
      setLikePending(false);
    }
  };

  return {
    confirmUnfriendOpen,
    setConfirmUnfriendOpen,
    friendPending,
    likePending,
    snackbar,
    closeSnackbar,
    toggleFriendApi,
    handleClick,
    handleLike,
  };
};

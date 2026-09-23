import type { AppStore } from '@/models';
import { toggleFriend } from '@/redux/states/friendsSlice';
import { togglePostLikes } from '@/redux/states/postsSlice';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { likePostService } from '../api';
import { fetchToggleFriendUserService } from '@/features/friends/api/friends.service';

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
  const authUser = useSelector((store: AppStore) => store.auth.user);
  const userId = 'id' in authUser ? authUser.id : '';
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
      const friends = await fetchToggleFriendUserService<string>(userId, authorId);
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

  // No args: invoked from a Button onClick where preventDefault is not needed.
  const handleClick = async (): Promise<void> => {
    if (isFriend) {
      setConfirmUnfriendOpen(true);
      return;
    }
    await toggleFriendApi();
  };

  const handleLike = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ): Promise<void> => {
    e.preventDefault();
    setLikePending(true);
    try {
      const response = await likePostService(postId, { userId });
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
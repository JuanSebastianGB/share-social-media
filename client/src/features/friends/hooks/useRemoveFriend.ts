import { UserApiModel } from '@/models';
import { removeFriend } from '@/redux/states/friendsSlice';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchToggleFriendUserService } from '../api/friends.service';

export const useRemoveFriend = (ownerId: string) => {
  const dispatch = useDispatch();
  const [pendingFriendId, setPendingFriendId] = useState<string | null>(null);
  const [confirmFriend, setConfirmFriend] = useState<UserApiModel | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'error' | 'success';
  }>({ open: false, message: '', severity: 'error' });

  const closeSnackbar = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));

  const handleRemoveFriend = async () => {
    if (!confirmFriend) return;
    const friendId = confirmFriend._id;
    setPendingFriendId(friendId);
    try {
      await fetchToggleFriendUserService<string>(ownerId, friendId);
      dispatch(removeFriend(friendId));
      setConfirmFriend(null);
      setSnackbar({
        open: true,
        message: 'Friend removed',
        severity: 'success',
      });
    } catch {
      setSnackbar({
        open: true,
        message: "Couldn't remove friend. Please try again.",
        severity: 'error',
      });
    } finally {
      setPendingFriendId(null);
    }
  };

  return {
    pendingFriendId,
    confirmFriend,
    setConfirmFriend,
    snackbar,
    closeSnackbar,
    handleRemoveFriend,
  };
};

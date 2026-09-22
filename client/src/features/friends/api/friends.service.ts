import { Api } from '@/shared/lib/interceptors';
import { isLocalPreviewEnabled } from '@/shared/lib/utilities';

export const fetchFriendsService = async (id: string, options = {}) => {
  if (isLocalPreviewEnabled()) {
    return [];
  }

  return await Api.get(`/users/${id}/friends`, options)
    .then((data) => data.data)
    .catch((error) => {
      throw error;
    });
};

export const fetchToggleFriendUserService = async <T>(userId: T, friendId: T) =>
  await Api.patch(`/users/${userId}/${friendId}`).then((data) => data.data);

import { Api } from '@/interceptors';

export const fetchFriendsService = async (id: string) =>
  await Api.get(`/users/${id}/friends`)
    .then((data) => data.data)
    .catch((error) => {
      throw error;
    });

export const fetchToggleFriendUserService = async <T>(userId: T, friendId: T) =>
  await Api.patch(`/users/${userId}/${friendId}`).then((data) => data.data);

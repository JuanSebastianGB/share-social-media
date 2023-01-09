import { Api } from '@/interceptors';

export const fetchFriendsService = async (id: string, token: string) =>
  await Api.get(`/users/${id}/friends`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
    .then((data) => data.data)
    .catch((error) => {
      throw error;
    });

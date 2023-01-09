import { Api } from '@/interceptors';

interface Props {
  id: string;
  token: string;
}

export const fetchUserService = async ({ id, token }: Props) =>
  await Api.get(`users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((data) => data.data)
    .catch((error) => {
      throw error;
    });

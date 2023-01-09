import { Api } from '@/interceptors';

interface Props {
  token: string;
}

export const fetchPostsService = async ({ token }: Props) =>
  await Api.get(`posts`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((data) => data.data)
    .catch((error) => {
      throw error;
    });

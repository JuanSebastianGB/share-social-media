import { Api } from '@/interceptors';

export const checkTokenService = async (token: string) =>
  await Api.get('/checktoken', {
    headers: {
      Authorization: !!token ? `Bearer ${token}` : '',
    },
  })
    .then((data) => data.data)
    .catch((error) => {
      throw error;
    });

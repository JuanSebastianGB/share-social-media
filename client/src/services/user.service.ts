import { Api } from '@/interceptors';

export const fetchUserService = async (id: string) =>
  await Api.get(`users/${id}`)
    .then((data) => data.data)
    .catch((error) => {
      throw error;
    });

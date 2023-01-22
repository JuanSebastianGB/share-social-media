import { Api } from '@/interceptors';

export const fetchUserService = async (id: string, options = {}) =>
  await Api.get(`users/${id}`, options)
    .then((data) => data.data)
    .catch((error) => {
      throw error;
    });

import { Api } from '@/shared/lib/interceptors';

export const createDefault = async () => {
  await Api.get('/defaultstorage').then((data) => data.data);
};

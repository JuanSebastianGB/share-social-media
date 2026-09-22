import { Api } from '@/shared/lib/interceptors';

export const fetchFiles = async () =>
  await Api.get('/storage').then((data) => data.data);

export const createDefault = async () => {
  await Api.get('/defaultstorage').then((data) => data.data);
};

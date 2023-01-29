import { Api } from '@/interceptors';

export const fetchFiles = async () =>
  await Api.get('/storage').then((data) => data.data);

export const createDefault = async () => {
  await Api.get('/defaulstorage').then((data) => data.data);
};

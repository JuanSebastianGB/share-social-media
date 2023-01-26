import { ApiJson } from '@/interceptors';

export const fetchPostComments = async (id: string) => {
  return await ApiJson.get(`/posts/${id}/comments`)
    .then((data) => data.data)
    .catch((error) => {
      throw error;
    });
};

export const postComment = async (body = {}) => {
  return await ApiJson.post('/comments', body)
    .then((data) => data.data)
    .catch((error) => {
      throw error;
    });
};

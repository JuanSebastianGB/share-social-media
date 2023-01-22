import { Api, ApiJson } from '@/interceptors';

export const fetchPostsService = async (page: number, options: object) => {
  return await Api.get(`posts?page=${page}`, options)
    .then((data) => data.data)
    .catch((error) => {
      throw error;
    });
};

export const fetchUserPostsService = async (
  id: string | undefined,
  options: object
) =>
  await Api.get(`/users/${id}/posts`, options)
    .then((data) => data.data)
    .catch((error) => {
      throw error;
    });

export const makePostService = async (formData: FormData) =>
  await Api.post('/posts', formData)
    .then((data) => data.data)
    .catch((error) => {
      throw error;
    });

export const likePostService = async (
  postId: string,
  body: { userId: string }
) =>
  await ApiJson.put(`/posts/${postId}`, body)
    .then((data) => data.data)
    .catch((error) => {
      throw error;
    });

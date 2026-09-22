import { Api, ApiJson } from '@/shared/lib/interceptors';
import { isLocalPreviewEnabled } from '@/shared/lib/utilities';

export const fetchPostsService = async (
  page: number,
  search: string,
  options: object
) => {
  if (isLocalPreviewEnabled()) {
    return [];
  }

  return await Api.get(`posts?page=${page}&search=${search}`, options)
    .then((data) => data.data)
    .catch((error) => {
      throw error;
    });
};

export const fetchUserPostsService = async (
  id: string | undefined,
  options: object
) => {
  if (isLocalPreviewEnabled()) {
    return [];
  }

  return await Api.get(`/users/${id}/posts`, options)
    .then((data) => data.data)
    .catch((error) => {
      throw error;
    });
};

export const makePostService = async (formData: FormData) =>
  await ApiJson.post('/posts', formData)
    .then((data) => data.data)
    .catch((error) => {
      throw error;
    });
export const makePostFileService = async (formData: FormData) =>
  await Api.post('/posts/file', formData)
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

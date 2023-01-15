import { Api, ApiJson } from '@/interceptors';

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

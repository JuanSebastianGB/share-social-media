import { PostApiModel } from '@/models';

export const postAdapter = (post: PostApiModel) => {
  return {
    id: post._id,
    body: post.body,
    likes: post.likes,
    comments: post.comments,
    file: post.file,
    user: post.user
  };
};

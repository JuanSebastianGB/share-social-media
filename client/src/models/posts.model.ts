import { PostApiModel } from './post.model';

export interface PostsState {
  posts: PostApiModel[];
  page: number;
  search: string;
}

export const postsEmptyState: PostsState = {
  posts: [],
  page: 1,
  search: '',
};

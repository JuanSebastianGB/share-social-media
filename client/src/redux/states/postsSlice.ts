import { StoreKeys } from '@/constants';
import { postsEmptyState } from '@/models';
import { createSlice } from '@reduxjs/toolkit';
import { makeLogin, makeLogout } from './authSlice';

const postsSlice = createSlice({
  name: StoreKeys.POSTS,
  initialState: postsEmptyState,
  reducers: {
    setPosts: (state, action) => ({
      ...state,
      posts: action.payload.posts,
      page: 1,
    }),
    searchPosts: (state, action) => ({
      ...state,
      page: 1,
      search: action.payload,
      posts: [],
    }),
    updatePost: (state, action) => ({
      ...state,
      posts: state.posts.map((post) => {
        if (post._id === action.payload._id) return action.payload;
        return post;
      }),
    }),
    growPostList: (state, action) => ({
      ...state,
      posts: [...state.posts, ...action.payload],
    }),
    incrementPage: (state, _action) => ({ ...state, page: state.page + 1 }),
    createPost: (state, action) => {
      return {
        ...state,
        posts: [action.payload, ...state.posts],
      };
    },
    togglePostLikes: (state, action) => {
      return {
        ...state,
        posts: state.posts.map((post) => {
          if (post._id === action.payload._id)
            return { ...post, likes: action.payload.likes };
          return post;
        }),
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(makeLogin, () => postsEmptyState)
      .addCase(makeLogout, () => postsEmptyState);
  },
});

export const {
  setPosts,
  searchPosts,
  updatePost,
  growPostList,
  incrementPage,
  createPost,
  togglePostLikes,
} = postsSlice.actions;

export default postsSlice.reducer;

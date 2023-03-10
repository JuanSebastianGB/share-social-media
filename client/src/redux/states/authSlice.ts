import { StoreKeys } from '@/constants';
import { authEmptyState, userEmptyState } from '@/models';
import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: StoreKeys.AUTH,
  initialState: authEmptyState,
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
    incrementPage: (state, action) => ({ ...state, page: state.page + 1 }),
    createPost: (state, action) => {
      return {
        ...state,
        posts: [action.payload, ...state.posts],
      };
    },
    makeLogin: (state, action) => ({
      ...state,
      user: action.payload.user,
      token: action.payload.token,
      page: 1,
      posts: [],
      search: '',
    }),
    makeLogout: (state, action) => ({
      ...state,
      user: userEmptyState,
      posts: [],
      friends: [],
      token: '',
      page: 1,
      search: '',
    }),
    toggleMode: (state, action) => ({
      ...state,
      mode: action.payload.mode === 'dark' ? 'light' : 'dark',
      // page: 1,
      // search: '',
    }),
    setFriends: (state, action) => {
      return {
        ...state,
        friends: action.payload.friends,
      };
    },
    removeFriend: (state, action) => {
      return {
        ...state,
        friends: state.friends.filter(
          (friend) => friend._id !== action.payload
        ),
      };
    },
    toggleFriend: (state, action) => {
      return {
        ...state,
        friends: action.payload,
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
});

export const {
  setPosts,
  setFriends,
  makeLogin,
  makeLogout,
  toggleMode,
  removeFriend,
  toggleFriend,
  togglePostLikes,
  createPost,
  growPostList,
  incrementPage,
  searchPosts,
  updatePost,
} = authSlice.actions;

export default authSlice.reducer;

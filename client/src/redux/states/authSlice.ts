import { StoreKeys } from '@/constants';
import { authEmptyState, Post, userEmptyState } from '@/models';
import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: StoreKeys.AUTH,
  initialState: authEmptyState,
  reducers: {
    setPosts: (state, action) => ({ ...state, posts: action.payload.posts }),
    setPost: (state, action) => {
      const posts = state.posts.map((post: Post) => {
        if (post._id === action.payload.post._id) return action.payload.post;
        return post;
      });
      return { ...state, posts };
    },
    makeLogin: (state, action) => ({
      ...state,
      user: action.payload.user,
      token: action.payload.token,
    }),
    makeLogout: (state, action) => ({
      ...state,
      user: userEmptyState,
      token: '',
    }),
    toggleMode: (state, action) => ({
      ...state,
      mode: action.payload.mode === 'dark' ? 'light' : 'dark',
    }),
    setFriends: (state, action) => {
      if (!!state.user.email)
        return {
          ...state,
          user: { ...state.user, friends: action.payload.friends },
        };
      return state;
    },
  },
});

export const {
  setPost,
  setPosts,
  setFriends,
  makeLogin,
  makeLogout,
  toggleMode,
} = authSlice.actions;

export default authSlice.reducer;

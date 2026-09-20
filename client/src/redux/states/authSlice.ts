import { StoreKeys } from '@/constants';
import { authEmptyState, userEmptyState } from '@/models';
import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: StoreKeys.AUTH,
  initialState: authEmptyState,
  reducers: {
    makeLogin: (state, action) => ({
      ...state,
      user: action.payload.user,
      token: action.payload.token,
    }),
    makeLogout: (state, _action) => ({
      ...state,
      user: userEmptyState,
      friends: [],
      token: '',
    }),
    toggleMode: (state, action) => ({
      ...state,
      mode: action.payload.mode === 'dark' ? 'light' : 'dark',
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
  },
});

export const {
  setFriends,
  makeLogin,
  makeLogout,
  toggleMode,
  removeFriend,
  toggleFriend,
} = authSlice.actions;

export default authSlice.reducer;

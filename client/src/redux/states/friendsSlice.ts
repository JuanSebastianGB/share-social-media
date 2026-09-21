import { StoreKeys } from '@/constants';
import { friendsEmptyState } from '@/models';
import { createSlice } from '@reduxjs/toolkit';
import { makeLogout } from './authSlice';

const friendsSlice = createSlice({
  name: StoreKeys.FRIENDS,
  initialState: friendsEmptyState,
  reducers: {
    setFriends: (state, action) => ({
      ...state,
      friends: action.payload.friends,
    }),
    removeFriend: (state, action) => ({
      ...state,
      friends: state.friends.filter((friend) => friend._id !== action.payload),
    }),
    toggleFriend: (state, action) => ({
      ...state,
      friends: action.payload,
    }),
  },
  extraReducers: (builder) => {
    builder.addCase(makeLogout, () => friendsEmptyState);
  },
});

export const { setFriends, removeFriend, toggleFriend } = friendsSlice.actions;

export default friendsSlice.reducer;

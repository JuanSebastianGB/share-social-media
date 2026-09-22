import { StoreKeys } from '@/constants';
import { authEmptyState, userEmptyState } from '@/models';
import { clearLocalPreviewUser } from '@/shared/lib/utilities';
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
    makeLogout: (state, _action) => {
      clearLocalPreviewUser();
      return {
        ...state,
        user: userEmptyState,
        token: '',
      };
    },
  },
});

export const { makeLogin, makeLogout } = authSlice.actions;

export default authSlice.reducer;

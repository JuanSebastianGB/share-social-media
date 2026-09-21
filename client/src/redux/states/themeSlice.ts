import { StoreKeys } from '@/constants';
import { themeEmptyState } from '@/models';
import { createSlice } from '@reduxjs/toolkit';

const themeSlice = createSlice({
  name: StoreKeys.THEME,
  initialState: themeEmptyState,
  reducers: {
    toggleMode: (state, action) => ({
      ...state,
      mode: action.payload.mode === 'dark' ? 'light' : 'dark',
    }),
  },
});

export const { toggleMode } = themeSlice.actions;

export default themeSlice.reducer;

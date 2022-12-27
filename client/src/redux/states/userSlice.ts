import { StoreKeys } from '@/constants';
import { userEmptyState } from '@/models';
import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: StoreKeys.USER,
  initialState: userEmptyState,
  reducers: {
    setName: (state, action) => {
      state.name = action.payload;
    },
    reset: () => userEmptyState,
  },
});

export const { setName, reset } = userSlice.actions;
export default userSlice.reducer;

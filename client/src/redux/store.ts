import { AppStore } from '@/models/store.model';
import { configureStore } from '@reduxjs/toolkit';
import { authSlice, userSlice } from './states';

export default configureStore<AppStore>({
  reducer: {
    user: userSlice,
    auth: authSlice,
  },
});

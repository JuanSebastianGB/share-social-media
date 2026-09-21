import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  createMigrate,
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  PURGE,
  REGISTER,
  REHYDRATE,
  type PersistedState,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { authSlice, friendsSlice, postsSlice } from './states';

type LegacyPersistedRoot = PersistedState & {
  auth?: {
    posts?: unknown[];
    page?: number;
    search?: string;
    friends?: unknown[];
    [key: string]: unknown;
  };
  posts?: {
    posts: unknown[];
    page: number;
    search: string;
  };
  friends?: {
    friends: unknown[];
  };
};

const migrations = {
  2: (state: PersistedState): PersistedState => {
    if (!state) return state;

    const legacy = state as LegacyPersistedRoot;
    const auth = legacy.auth;
    if (!auth) return state;

    const { posts, page, search, ...authRest } = auth;
    return {
      ...legacy,
      auth: authRest,
      posts: {
        posts: Array.isArray(posts) ? posts : [],
        page: typeof page === 'number' ? page : 1,
        search: typeof search === 'string' ? search : '',
      },
    } as PersistedState;
  },
  3: (state: PersistedState): PersistedState => {
    if (!state) return state;

    const legacy = state as LegacyPersistedRoot;
    const auth = legacy.auth;
    if (!auth) return state;

    const { friends, ...authRest } = auth;
    return {
      ...legacy,
      auth: authRest,
      friends: {
        friends: Array.isArray(friends) ? friends : [],
      },
    } as PersistedState;
  },
};

const persistConfig = {
  key: 'root',
  storage,
  version: 3,
  migrate: createMigrate(migrations, { debug: false }),
};

const rootReducer = combineReducers({
  auth: authSlice,
  posts: postsSlice,
  friends: friendsSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

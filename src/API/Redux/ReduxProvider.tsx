import { configureStore } from '@reduxjs/toolkit';

import { learningAppApi } from './reduxQueryFetch';

export const store = configureStore({
  reducer: {
    [learningAppApi.reducerPath]: learningAppApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(learningAppApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/userSlice';
import cryptoReducer from '../features/cryptoSlice';
import alertReducer from '../features/alertSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    crypto: cryptoReducer,
    alert: alertReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../app/store'

interface User {
  email: string;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    addUser: (state, action: PayloadAction<string>) => {
      state.user = { email: action.payload };
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    // Legacy removeUser for backwards compatibility
    removeUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  },
})

export const { addUser, logout, removeUser } = userSlice.actions

export const selectUser = (state: RootState) => state.user.user

export default userSlice.reducer
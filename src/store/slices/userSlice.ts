import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UserData, ResponseIdentityI, GetUserStoresParams } from '@interfaces/api';
import { request } from '@services/identityService';
import { getUserStores } from '@redux/thunks/user.thunk';

interface UserState {
  userData: UserData | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  userData: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Synchronous actions
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    clearUser: (state) => {
      state.userData = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle getUserStores async thunk
      .addCase(getUserStores.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserStores.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userData = action.payload.data;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getUserStores.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch user stores';
        state.userData = null;
      });
  },
});

export const { setAuthenticated, clearUser, clearError } = userSlice.actions;

export default userSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../config/axios';
import { API_ENDPOINTS } from '../config/constants';

interface Alert {
  id: number;
  coinId: string;
  condition: string;
  targetPrice: number;
  triggered: boolean;
  createdAt: string;
}

interface AlertState {
  alerts: Alert[];
  loading: boolean;
  error: string | null;
}

const initialState: AlertState = {
  alerts: [],
  loading: false,
  error: null,
};

export const fetchAlerts = createAsyncThunk(
  'alert/fetchAlerts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.ALERTS.GET_MY_ALERTS);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch alerts');
    }
  }
);

export const createAlert = createAsyncThunk(
  'alert/createAlert',
  async (alertData: { coinId: string; condition: string; targetPrice: number }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.ALERTS.CREATE, alertData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create alert');
    }
  }
);

export const deleteAlert = createAsyncThunk(
  'alert/deleteAlert',
  async (alertId: number, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(API_ENDPOINTS.ALERTS.DELETE(alertId));
      return alertId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete alert');
    }
  }
);

const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlerts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.loading = false;
        state.alerts = action.payload;
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createAlert.fulfilled, (state, action) => {
        state.alerts.unshift(action.payload);
      })
      .addCase(deleteAlert.fulfilled, (state, action) => {
        state.alerts = state.alerts.filter(alert => alert.id !== action.payload);
      });
  },
});

export default alertSlice.reducer;

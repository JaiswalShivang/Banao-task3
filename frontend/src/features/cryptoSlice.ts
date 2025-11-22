import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../config/axios';
import { API_ENDPOINTS } from '../config/constants';

interface Crypto {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
}

interface CryptoState {
  cryptos: Crypto[];
  loading: boolean;
  error: string | null;
}

const initialState: CryptoState = {
  cryptos: [],
  loading: false,
  error: null,
};

export const fetchCryptos = createAsyncThunk(
  'crypto/fetchCryptos',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.CRYPTO.PRICES);
      return response.data.slice(0, 20);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch prices');
    }
  }
);

const cryptoSlice = createSlice({
  name: 'crypto',
  initialState,
  reducers: {
    updatePrices: (state, action: PayloadAction<Crypto[]>) => {
      state.cryptos = action.payload.slice(0, 20);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCryptos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCryptos.fulfilled, (state, action) => {
        state.loading = false;
        state.cryptos = action.payload;
      })
      .addCase(fetchCryptos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { updatePrices } = cryptoSlice.actions;
export default cryptoSlice.reducer;

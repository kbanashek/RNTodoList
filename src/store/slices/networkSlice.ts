import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SyncStatus } from '../../types/index';

interface NetworkStatusPayload {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  connectionType: string | null;
}

interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  connectionType: string | null;
  syncStatus: SyncStatus;
  lastChecked: string;
}

const initialState: NetworkState = {
  isConnected: false,
  isInternetReachable: null,
  connectionType: null,
  syncStatus: 'pending',
  lastChecked: new Date().toISOString(),
};

const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    setNetworkStatus: (state, action: PayloadAction<NetworkStatusPayload>) => {
      state.isConnected = action.payload.isConnected;
      state.isInternetReachable = action.payload.isInternetReachable;
      state.connectionType = action.payload.connectionType;
      state.lastChecked = new Date().toISOString();
    },
    setSyncStatus: (state, action: PayloadAction<SyncStatus>) => {
      state.syncStatus = action.payload;
    },
  },
});

export const { setNetworkStatus, setSyncStatus } = networkSlice.actions;
export default networkSlice.reducer;

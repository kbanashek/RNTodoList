import * as Network from 'expo-network';

let mockNetworkState = {
  isConnected: true,
  type: Network.NetworkStateType.WIFI,
  isInternetReachable: true,
};

export const setMockNetworkState = (state: Partial<typeof mockNetworkState>) => {
  mockNetworkState = { ...mockNetworkState, ...state };
};

export const getMockNetworkState = () => mockNetworkState;

// Mock the expo-network functions in development
if (__DEV__) {
  jest.mock('expo-network', () => ({
    NetworkStateType: {
      NONE: 'NONE',
      WIFI: 'WIFI',
      CELLULAR: 'CELLULAR',
      BLUETOOTH: 'BLUETOOTH',
      ETHERNET: 'ETHERNET',
      VPN: 'VPN',
      OTHER: 'OTHER',
      UNKNOWN: 'UNKNOWN',
    },
    getNetworkStateAsync: () => Promise.resolve(mockNetworkState),
    isInternetReachable: () => Promise.resolve(mockNetworkState.isInternetReachable),
  }));
}

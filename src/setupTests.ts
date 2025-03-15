import '@testing-library/jest-native/extend-expect';

// Mock environment variables
jest.mock('@env', () => ({
  API_BASE_URL: 'https://dummyjson.com',
  USER_ID: '1',
  NETWORK_POLLING_ONLINE: '30000',
  NETWORK_POLLING_OFFLINE: '5000',
  NETWORK_MAX_RETRIES: '3',
  NETWORK_RETRY_DELAY: '1000',
}));

// Mock expo-network
jest.mock('expo-network', () => ({
  getNetworkStateAsync: jest.fn().mockResolvedValue({
    isConnected: true,
    isInternetReachable: true,
    type: 'WIFI',
  }),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

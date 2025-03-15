import '@testing-library/jest-native';

// Mock environment variables to match our offline-first architecture
jest.mock('@env', () => ({
  API_BASE_URL: 'https://dummyjson.com',
  USER_ID: '1',
  NETWORK_POLLING_ONLINE: '30000',  // 30s when online
  NETWORK_POLLING_OFFLINE: '5000',   // 5s when offline
  NETWORK_MAX_RETRIES: '3',
  NETWORK_RETRY_DELAY: '1000',
}));

// Mock expo-network for network monitoring
jest.mock('expo-network', () => ({
  getNetworkStateAsync: jest.fn().mockResolvedValue({
    isConnected: true,
    isInternetReachable: true,
    type: 'WIFI',
  }),
}));

// Mock AsyncStorage for local data persistence
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
}));

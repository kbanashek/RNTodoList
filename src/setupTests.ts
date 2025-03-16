// Mock AsyncStorage for offline data persistence
jest.mock('@react-native-async-storage/async-storage', () => {
  let store: { [key: string]: string } = {};
  return {
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
      return Promise.resolve();
    }),
    getItem: jest.fn((key: string) => {
      return Promise.resolve(store[key]);
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      store = {};
      return Promise.resolve();
    }),
    getAllKeys: jest.fn(() => Promise.resolve(Object.keys(store))),
    multiGet: jest.fn((keys: string[]) => 
      Promise.resolve(keys.map(key => [key, store[key]]))
    ),
  };
});

// Mock expo-network with proper NetworkStateType enum
jest.mock('expo-network', () => ({
  NetworkStateType: {
    NONE: 'NONE',
    CELLULAR: 'CELLULAR',
    WIFI: 'WIFI',
    BLUETOOTH: 'BLUETOOTH',
    ETHERNET: 'ETHERNET',
    VPN: 'VPN',
    OTHER: 'OTHER',
    UNKNOWN: 'UNKNOWN'
  },
  getNetworkStateAsync: jest.fn(() => Promise.resolve({
    isConnected: true,
    isInternetReachable: true,
    type: 'WIFI'
  }))
}));

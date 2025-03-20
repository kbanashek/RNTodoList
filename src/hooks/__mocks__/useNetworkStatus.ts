export const useNetworkStatus = jest.fn(() => ({
  isOffline: false,
  isInternetReachable: true,
  connectionType: 'wifi',
  lastUpdated: new Date().toISOString()
}));

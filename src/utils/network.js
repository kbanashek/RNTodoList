const Network = require('expo-network');

// Re-export the network functions in CommonJS format
module.exports = {
  NetworkStateType: Network.NetworkStateType,
  getNetworkStateAsync: Network.getNetworkStateAsync,
  getIpAddressAsync: Network.getIpAddressAsync,
  getMacAddressAsync: Network.getMacAddressAsync,
  isAirplaneModeEnabledAsync: Network.isAirplaneModeEnabledAsync
};

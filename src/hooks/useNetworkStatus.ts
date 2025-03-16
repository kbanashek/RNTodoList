import { useCallback, useEffect, useState } from "react";
import * as Network from "expo-network";
import { NetworkState, NetworkType } from "../store/types";

const initialState: NetworkState = {
  isOffline: true,
  isConnected: false,
  isInternetReachable: false,
  type: NetworkType.NONE,
  lastChecked: new Date().toISOString(),
};

export const useNetworkStatus = () => {
  const [state, setState] = useState<NetworkState>(initialState);

  const mapNetworkType = (type: Network.NetworkStateType): NetworkType => {
    switch (type) {
      case Network.NetworkStateType.NONE:
        return NetworkType.NONE;
      case Network.NetworkStateType.CELLULAR:
        return NetworkType.CELLULAR;
      case Network.NetworkStateType.WIFI:
        return NetworkType.WIFI;
      case Network.NetworkStateType.BLUETOOTH:
        return NetworkType.BLUETOOTH;
      case Network.NetworkStateType.ETHERNET:
        return NetworkType.ETHERNET;
      case Network.NetworkStateType.VPN:
        return NetworkType.VPN;
      case Network.NetworkStateType.OTHER:
        return NetworkType.OTHER;
      case Network.NetworkStateType.UNKNOWN:
      default:
        return NetworkType.UNKNOWN;
    }
  };

  const checkNetworkStatus = useCallback(async () => {
    try {
      const networkState = await Network.getNetworkStateAsync();
      
      setState({
        isOffline: !networkState.isConnected || !networkState.isInternetReachable,
        isConnected: networkState.isConnected,
        isInternetReachable: networkState.isInternetReachable ?? false,
        type: mapNetworkType(networkState.type),
        lastChecked: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error checking network status:", error);
      setState(prev => ({
        ...prev,
        isOffline: true,
        isConnected: false,
        isInternetReachable: false,
        type: NetworkType.NONE,
        lastChecked: new Date().toISOString(),
      }));
    }
  }, []);

  useEffect(() => {
    checkNetworkStatus();
    const interval = setInterval(checkNetworkStatus, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [checkNetworkStatus]);

  return state;
}

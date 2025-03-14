import { useCallback, useEffect, useState } from "react";
import * as Network from "expo-network";
import { NetworkState, NetworkType } from "../store/types";

const ONLINE_CHECK_INTERVAL = 30000; // 30 seconds
const OFFLINE_CHECK_INTERVAL = 5000; // 5 seconds

// Map Expo network types to our NetworkType
function mapNetworkType(type: Network.NetworkStateType): NetworkType {
  switch (type) {
    case Network.NetworkStateType.NONE:
      return "none";
    case Network.NetworkStateType.CELLULAR:
      return "cellular";
    case Network.NetworkStateType.WIFI:
      return "wifi";
    case Network.NetworkStateType.BLUETOOTH:
      return "bluetooth";
    case Network.NetworkStateType.ETHERNET:
      return "ethernet";
    case Network.NetworkStateType.VPN:
      return "vpn";
    case Network.NetworkStateType.OTHER:
      return "other";
    default:
      return "unknown";
  }
}

export function useNetworkStatus() {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: false, // Default to false for offline-first approach
    isInternetReachable: false,
    type: "none",
    lastChecked: new Date().toISOString(),
  });

  const checkNetworkStatus = useCallback(async () => {
    try {
      const networkState = await Network.getNetworkStateAsync();
      setNetworkState({
        isConnected: networkState.isConnected,
        isInternetReachable: networkState.isInternetReachable ?? false,
        type: mapNetworkType(networkState.type),
        lastChecked: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error checking network status:", error);
      setNetworkState(prev => ({
        ...prev,
        isConnected: false,
        isInternetReachable: false,
        type: "none",
        lastChecked: new Date().toISOString(),
      }));
    }
  }, []);

  // Initial check on mount
  useEffect(() => {
    checkNetworkStatus();
  }, [checkNetworkStatus]);

  // Polling effect
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const checkWithBackoff = async () => {
      if (!mounted) return;

      await checkNetworkStatus();

      // Use shorter polling interval when offline
      const interval = networkState.isConnected && networkState.isInternetReachable
        ? ONLINE_CHECK_INTERVAL
        : OFFLINE_CHECK_INTERVAL;

      timeoutId = setTimeout(checkWithBackoff, interval);
    };

    // Start polling
    timeoutId = setTimeout(checkWithBackoff, networkState.isConnected ? ONLINE_CHECK_INTERVAL : OFFLINE_CHECK_INTERVAL);

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [checkNetworkStatus, networkState.isConnected, networkState.isInternetReachable]);

  return {
    ...networkState,
    checkNetworkStatus,
    isOffline: !networkState.isConnected || !networkState.isInternetReachable,
  };
}

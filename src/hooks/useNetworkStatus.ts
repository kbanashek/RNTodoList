import { useState, useEffect } from "react";
import * as Network from "expo-network";

export interface NetworkState {
  isConnected: boolean;
  connectionType: string | null;
  isInternetReachable: boolean | null;
  lastCheck: string;
}

export const useNetworkStatus = () => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    connectionType: null,
    isInternetReachable: null,
    lastCheck: new Date().toISOString(),
  });

  useEffect(() => {
    let mounted = true;

    const checkNetworkStatus = async () => {
      try {
        const networkState = await Network.getNetworkStateAsync();
        
        if (mounted) {
          setNetworkState({
            isConnected: networkState.isConnected,
            connectionType: networkState.type,
            isInternetReachable: networkState.isInternetReachable,
            lastCheck: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error("Error checking network status:", error);
      }
    };

    // Initial check
    checkNetworkStatus();

    // Set up periodic checks
    const interval = setInterval(checkNetworkStatus, 3000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return networkState;
};

import { useState, useEffect } from "react";
import * as Network from "expo-network";

interface NetworkStatus {
  isConnected: boolean;
  type: Network.NetworkStateType;
  isInternetReachable: boolean;
  isChecking: boolean;
}

export const useNetworkStatus = () => {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true,
    type: Network.NetworkStateType.WIFI,
    isInternetReachable: true,
    isChecking: true,
  });

  useEffect(() => {
    let mounted = true;
    let intervalId: NodeJS.Timeout;

    const checkNetworkStatus = async () => {
      try {
        const networkState = await Network.getNetworkStateAsync();
        
        if (mounted) {
          setStatus({
            isConnected: networkState.isConnected,
            type: networkState.type,
            isInternetReachable: networkState.isInternetReachable,
            isChecking: false,
          });
        }
      } catch (error) {
        console.warn("Error checking network status:", error);
        if (mounted) {
          setStatus((prev) => ({ ...prev, isChecking: false }));
        }
      }
    };

    // Initial check
    checkNetworkStatus();

    // Set up interval for periodic checks
    intervalId = setInterval(checkNetworkStatus, 3000);

    return () => {
      mounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  return status;
};

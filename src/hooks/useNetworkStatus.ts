import { useState, useEffect } from "react";
import * as Network from "expo-network";
import { NetworkState } from "../store/types";

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkState>({
    isConnected: true,
    isInternetReachable: true,
    connectionType: Network.NetworkStateType.WIFI,
    lastCheckTimestamp: new Date().toISOString(),
  });

  useEffect(() => {
    let mounted = true;

    const checkNetworkStatus = async () => {
      try {
        const networkState = await Network.getNetworkStateAsync();

        // console.log('Network check:', {
        //   isConnected: networkState.isConnected,
        //   isInternetReachable: networkState.isInternetReachable,
        //   type: networkState.type
        // });

        if (mounted) {
          setNetworkStatus((prev) => ({
            ...prev,
            isConnected: networkState.isConnected,
            isInternetReachable: networkState.isInternetReachable ?? false,
            connectionType: networkState.type,
            lastCheckTimestamp: new Date().toISOString(),
          }));
        }
      } catch (error) {
        console.error("Error checking network status:", error);
        if (mounted) {
          setNetworkStatus((prev) => ({
            ...prev,
            isConnected: false,
            isInternetReachable: false,
            lastCheckTimestamp: new Date().toISOString(),
          }));
        }
      }
    };

    // Initial check
    checkNetworkStatus();

    // Check every 3 seconds per memory
    const networkInterval = setInterval(checkNetworkStatus, 3000);

    return () => {
      mounted = false;
      clearInterval(networkInterval);
    };
  }, []);

  return networkStatus;
};

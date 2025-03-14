import { useState, useEffect } from 'react';
import * as Network from 'expo-network';
import { NetworkState } from '../store/types';

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
        // First check basic network connectivity
        const networkState = await Network.getNetworkStateAsync();
        
        // Then try to make a network request to verify internet access
        let isInternetReachable = false;
        if (networkState.isConnected) {
          try {
            const response = await fetch('https://dummyjson.com/todos/1', { 
              method: 'HEAD',
              // Short timeout to avoid hanging
              signal: AbortSignal.timeout(3000)
            });
            isInternetReachable = response.ok;
          } catch {
            isInternetReachable = false;
          }
        }

        if (mounted) {
          setNetworkStatus(prev => ({
            ...prev,
            isConnected: networkState.isConnected,
            isInternetReachable,
            connectionType: networkState.type,
            lastCheckTimestamp: new Date().toISOString(),
          }));
        }
      } catch (error) {
        console.error('Error checking network status:', error);
        if (mounted) {
          setNetworkStatus(prev => ({
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

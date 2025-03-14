import { useState, useEffect, useCallback } from "react";
import * as Network from 'expo-network';
import type { NetworkState } from '@types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NETWORK_STATE_CACHE = 'network_state_cache';

const mapNetworkType = (type: Network.NetworkStateType): NetworkState['type'] => {
  switch (type) {
    case Network.NetworkStateType.WIFI:
      return 'wifi';
    case Network.NetworkStateType.CELLULAR:
      return 'cellular';
    default:
      return 'none';
  }
};

export const useNetworkStatus = () => {
  const [status, setStatus] = useState<NetworkState>({
    isConnected: false, // Start pessimistic
    type: 'none',
    isInternetReachable: false,
    lastChecked: Date.now()
  });

  // Load cached network state
  useEffect(() => {
    const loadCachedState = async () => {
      try {
        const cached = await AsyncStorage.getItem(NETWORK_STATE_CACHE);
        if (cached) {
          const cachedState = JSON.parse(cached);
          setStatus(cachedState);
        }
      } catch (error) {
        console.warn("Error loading cached network state:", error);
      }
    };
    loadCachedState();
  }, []);

  const checkNetworkStatus = useCallback(async () => {
    try {
      const networkState = await Network.getNetworkStateAsync();
      const newStatus: NetworkState = {
        isConnected: networkState.isConnected,
        type: mapNetworkType(networkState.type),
        isInternetReachable: networkState.isInternetReachable ?? false,
        lastChecked: Date.now()
      };
      
      setStatus(newStatus);
      
      // Cache the network state
      try {
        await AsyncStorage.setItem(NETWORK_STATE_CACHE, JSON.stringify(newStatus));
      } catch (error) {
        console.warn("Error caching network state:", error);
      }
    } catch (error) {
      console.warn("Error checking network status:", error);
      const offlineStatus: NetworkState = {
        isConnected: false,
        type: 'none',
        isInternetReachable: false,
        lastChecked: Date.now()
      };
      setStatus(offlineStatus);
      
      // Cache the offline state
      try {
        await AsyncStorage.setItem(NETWORK_STATE_CACHE, JSON.stringify(offlineStatus));
      } catch (cacheError) {
        console.warn("Error caching offline state:", cacheError);
      }
    }
  }, []);

  // Check network status periodically
  useEffect(() => {
    let mounted = true;
    let intervalId: NodeJS.Timeout;

    const check = async () => {
      if (mounted) {
        await checkNetworkStatus();
      }
    };

    // Initial check
    check();

    // Set up interval for periodic checks every 3 seconds
    intervalId = setInterval(check, 3000);

    return () => {
      mounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [checkNetworkStatus]);

  return status;
};

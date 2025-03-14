import { useEffect, useCallback, useRef } from 'react';
import * as Network from 'expo-network';
import { useAppDispatch, useAppSelector, setNetworkStatus } from '../store';
import { todoService } from '../services/todoService';

export const useNetworkStatus = () => {
  const dispatch = useAppDispatch();
  const networkState = useAppSelector(state => state.network);
  const mounted = useRef(true);

  const checkNetworkStatus = useCallback(async () => {
    try {
      const networkState = await Network.getNetworkStateAsync();

      if (!mounted.current) return;

      dispatch(setNetworkStatus({
        isConnected: networkState.isConnected,
        isInternetReachable: networkState.isInternetReachable,
        connectionType: networkState.type,
      }));

      // Trigger sync if we're back online and have pending changes
      if (networkState.isConnected && networkState.isInternetReachable) {
        const pendingChanges = todoService.getPendingChanges();
        if (pendingChanges.length > 0) {
          await todoService.syncTasks();
        }
      }
    } catch (error) {
      console.error('Error checking network status:', error);
      if (!mounted.current) return;

      dispatch(setNetworkStatus({
        isConnected: false,
        isInternetReachable: false,
        connectionType: null,
      }));
    }
  }, [dispatch]);

  useEffect(() => {
    mounted.current = true;

    // Initial check
    checkNetworkStatus();

    // Set up periodic checks
    const intervalId = setInterval(checkNetworkStatus, 3000);

    return () => {
      mounted.current = false;
      clearInterval(intervalId);
    };
  }, [checkNetworkStatus]);

  return networkState;
};

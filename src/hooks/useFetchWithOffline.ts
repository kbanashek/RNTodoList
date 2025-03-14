import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetworkStatus } from './useServiceCheck';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

interface FetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

interface FetchState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  lastUpdated: number | null;
}

interface CachedData<T> {
  data: T;
  timestamp: number;
}

export function useFetchWithOffline<T>(
  endpoint: string,
  options: FetchOptions = {},
  cacheKey?: string
) {
  const url = `${API_BASE_URL}${endpoint}`;
  const storageKey = cacheKey || endpoint;
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    error: null,
    isLoading: true,
    lastUpdated: null,
  });

  const isOffline = !isConnected || !isInternetReachable;

  const loadCachedData = useCallback(async () => {
    try {
      const cached = await AsyncStorage.getItem(storageKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached) as CachedData<T>;
        setState({
          data,
          error: null,
          isLoading: false,
          lastUpdated: timestamp,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading cached data:', error);
      return false;
    }
  }, [storageKey]);

  const fetchData = useCallback(async () => {
    if (isOffline) {
      const hasCachedData = await loadCachedData();
      if (!hasCachedData) {
        setState(prev => ({
          ...prev,
          data: [] as unknown as T,
          isLoading: false,
        }));
      }
      return;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const cachedData: CachedData<T> = {
        data,
        timestamp: Date.now(),
      };

      await AsyncStorage.setItem(storageKey, JSON.stringify(cachedData));

      setState({
        data,
        error: null,
        isLoading: false,
        lastUpdated: cachedData.timestamp,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      const hasCachedData = await loadCachedData();
      
      if (!hasCachedData) {
        setState(prev => ({
          ...prev,
          data: [] as unknown as T,
          error: error as Error,
          isLoading: false,
        }));
      }
    }
  }, [url, options, storageKey, isOffline, loadCachedData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(async () => {
    if (isOffline) {
      return;
    }
    setState(prev => ({ ...prev, isLoading: true }));
    await fetchData();
  }, [isOffline, fetchData]);

  return {
    ...state,
    isOffline,
    refetch,
  };
}

import { renderHook, act } from '@testing-library/react-native';
import * as Network from 'expo-network';
import { useNetworkStatus } from '../network/useNetworkStatus';
import { NetworkType } from '../../store/types';

jest.mock('expo-network');

describe('useNetworkStatus', () => {
  const originalConsoleError = console.error;
  
  beforeAll(() => {
    console.error = jest.fn();
  });
  
  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with offline state', () => {
    const { result } = renderHook(() => useNetworkStatus());
    
    expect(result.current).toEqual({
      isOffline: true,
      isConnected: false,
      isInternetReachable: false,
      type: NetworkType.NONE,
      lastChecked: expect.any(String)
    });
  });

  it('updates state when network is connected', async () => {
    (Network.getNetworkStateAsync as jest.Mock).mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
      type: Network.NetworkStateType.WIFI
    });

    const { result } = renderHook(() => useNetworkStatus());
    
    // Wait for the async effect to complete
    await act(async () => {
      // Just wait for the next tick
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(result.current).toEqual({
      isOffline: false,
      isConnected: true,
      isInternetReachable: true,
      type: NetworkType.WIFI,
      lastChecked: expect.any(String)
    });
  });

  it('updates state when network is connected but internet is not reachable', async () => {
    (Network.getNetworkStateAsync as jest.Mock).mockResolvedValue({
      isConnected: true,
      isInternetReachable: false,
      type: Network.NetworkStateType.WIFI
    });

    const { result } = renderHook(() => useNetworkStatus());
    
    // Wait for the async effect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(result.current).toEqual({
      isOffline: true,
      isConnected: true,
      isInternetReachable: false,
      type: NetworkType.WIFI,
      lastChecked: expect.any(String)
    });
  });

  it('updates state when network is disconnected', async () => {
    (Network.getNetworkStateAsync as jest.Mock).mockResolvedValue({
      isConnected: false,
      isInternetReachable: false,
      type: Network.NetworkStateType.NONE
    });

    const { result } = renderHook(() => useNetworkStatus());
    
    // Wait for the async effect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(result.current).toEqual({
      isOffline: true,
      isConnected: false,
      isInternetReachable: false,
      type: NetworkType.NONE,
      lastChecked: expect.any(String)
    });
  });

  it('handles errors when checking network status', async () => {
    (Network.getNetworkStateAsync as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    const { result } = renderHook(() => useNetworkStatus());
    
    // Wait for the async effect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(result.current).toEqual({
      isOffline: true,
      isConnected: false,
      isInternetReachable: false,
      type: NetworkType.NONE,
      lastChecked: expect.any(String)
    });
    expect(console.error).toHaveBeenCalledWith(
      'Error checking network status:',
      expect.any(Error)
    );
  });

  it('maps network types correctly', async () => {
    // Test WIFI type
    (Network.getNetworkStateAsync as jest.Mock).mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
      type: Network.NetworkStateType.WIFI
    });

    const { result: wifiResult } = renderHook(() => useNetworkStatus());
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(wifiResult.current.type).toBe(NetworkType.WIFI);

    // Cleanup and reset for next test
    jest.clearAllMocks();

    // Test CELLULAR type
    (Network.getNetworkStateAsync as jest.Mock).mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
      type: Network.NetworkStateType.CELLULAR
    });

    const { result: cellularResult } = renderHook(() => useNetworkStatus());
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(cellularResult.current.type).toBe(NetworkType.CELLULAR);

    // Cleanup and reset for next test
    jest.clearAllMocks();

    // Test NONE type
    (Network.getNetworkStateAsync as jest.Mock).mockResolvedValue({
      isConnected: false,
      isInternetReachable: false,
      type: Network.NetworkStateType.NONE
    });

    const { result: noneResult } = renderHook(() => useNetworkStatus());
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(noneResult.current.type).toBe(NetworkType.NONE);
  });

  it('handles unknown network types', async () => {
    (Network.getNetworkStateAsync as jest.Mock).mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
      type: 'INVALID_TYPE' as Network.NetworkStateType
    });

    const { result } = renderHook(() => useNetworkStatus());
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(result.current.type).toBe(NetworkType.UNKNOWN);
  });

  it('cleans up interval on unmount', () => {
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    
    const { unmount } = renderHook(() => useNetworkStatus());
    
    unmount();
    
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});

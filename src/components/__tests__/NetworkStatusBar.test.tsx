import React from 'react';
import { render } from '@testing-library/react-native';
import { NetworkStatusBar } from '../NetworkStatusBar';

// Mock the useNetworkStatus hook
jest.mock('../../hooks/network/useNetworkStatus', () => ({
  useNetworkStatus: jest.fn(),
}));

describe('NetworkStatusBar', () => {
  const useNetworkStatusMock = require('../../hooks/network/useNetworkStatus').useNetworkStatus;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when online', () => {
    // Mock the hook to return online status
    useNetworkStatusMock.mockReturnValue({
      isOffline: false,
    });

    const { queryByText } = render(<NetworkStatusBar />);

    // Component should return null when online
    expect(queryByText(/offline/i)).toBeNull();
  });

  it('renders message when offline', () => {
    // Mock the hook to return offline status
    useNetworkStatusMock.mockReturnValue({
      isOffline: true,
    });

    const { getByText } = render(<NetworkStatusBar />);

    // Should display offline message
    expect(getByText(/offline/i)).toBeTruthy();
  });
});

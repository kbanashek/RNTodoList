import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useAppSelector } from '../store';
import { todoService } from '../services/todoService';

export const NetworkStatusBar: React.FC = () => {
  const { isConnected, connectionType, isInternetReachable } = useNetworkStatus();
  const { syncStatus } = useAppSelector(state => state.network);
  const pendingChanges = todoService.getPendingChanges();

  const handleRetry = useCallback(async () => {
    if (isConnected && isInternetReachable) {
      await todoService.syncTasks();
    }
  }, [isConnected, isInternetReachable]);

  if (isConnected && isInternetReachable && syncStatus === 'synced' && pendingChanges.length === 0) {
    return null;
  }

  const getBgColor = () => {
    if (!isConnected) return '#ff6b6b';
    if (!isInternetReachable) return '#ffd93d';
    if (syncStatus === 'error') return '#ff6b6b';
    if (syncStatus === 'pending') return '#4dabf7';
    return '#51cf66';
  };

  const getMessage = () => {
    if (!isConnected) {
      return 'Offline - Changes will sync when connection is restored';
    }
    if (!isInternetReachable) {
      return `Connected to ${connectionType || 'network'} but no internet access`;
    }
    if (syncStatus === 'error') {
      return 'Sync failed - Tap to retry';
    }
    if (syncStatus === 'pending' || pendingChanges.length > 0) {
      return `Syncing ${pendingChanges.length} changes...`;
    }
    return '';
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: getBgColor() }]}
      onPress={syncStatus === 'error' ? handleRetry : undefined}
      disabled={syncStatus !== 'error'}
    >
      <Text style={styles.text}>{getMessage()}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
});

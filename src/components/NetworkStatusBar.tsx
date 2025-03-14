import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppSelector } from '../store';
import { todoService } from '../services/todoService';
import { PendingChange } from '../store/types';

export const NetworkStatusBar: React.FC = () => {
  const { isConnected, isInternetReachable, connectionType } = useAppSelector(state => state.network);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);

  useEffect(() => {
    const loadPendingChanges = async () => {
      try {
        const changes = await todoService.getPendingChanges();
        setPendingChanges(changes);
      } catch (error) {
        console.error('Error loading pending changes:', error);
      }
    };

    loadPendingChanges();
    const interval = setInterval(loadPendingChanges, 3000); // Check every 3 seconds per memory

    return () => clearInterval(interval);
  }, []);

  const getStatusMessage = () => {
    if (!isConnected) {
      return {
        text: 'Offline Mode - Changes saved locally',
        style: styles.offlineText,
        containerStyle: styles.offlineContainer,
      };
    }

    if (!isInternetReachable) {
      return {
        text: `Limited connectivity (${connectionType}) - Local changes only`,
        style: styles.warningText,
        containerStyle: styles.warningContainer,
      };
    }

    if (pendingChanges.length > 0) {
      const errorChanges = pendingChanges.filter(change => change.error);
      if (errorChanges.length > 0) {
        return {
          text: `Sync Error - ${errorChanges.length} change${errorChanges.length === 1 ? '' : 's'} failed`,
          style: styles.errorText,
          containerStyle: styles.errorContainer,
        };
      }
      return {
        text: `Syncing ${pendingChanges.length} change${pendingChanges.length === 1 ? '' : 's'}...`,
        style: styles.syncingText,
        containerStyle: styles.syncingContainer,
      };
    }

    return {
      text: `Connected (${connectionType}) - All changes synced`,
      style: styles.onlineText,
      containerStyle: styles.onlineContainer,
    };
  };

  const status = getStatusMessage();

  return (
    <View style={[styles.container, status.containerStyle]}>
      <Text style={[styles.text, status.style]} numberOfLines={1}>
        {status.text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
  offlineContainer: {
    backgroundColor: '#FF3B30',
  },
  offlineText: {
    color: '#FFFFFF',
  },
  warningContainer: {
    backgroundColor: '#FF9500',
  },
  warningText: {
    color: '#FFFFFF',
  },
  syncingContainer: {
    backgroundColor: '#007AFF',
  },
  syncingText: {
    color: '#FFFFFF',
  },
  onlineContainer: {
    backgroundColor: '#34C759',
  },
  onlineText: {
    color: '#FFFFFF',
  },
  errorContainer: {
    backgroundColor: '#FF2D55',
  },
  errorText: {
    color: '#FFFFFF',
  },
});

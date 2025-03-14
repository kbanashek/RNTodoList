import React from 'react';
import { StyleSheet } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export function NetworkStatusBar() {
  const { isOffline } = useNetworkStatus();

  if (!isOffline) {
    return null;
  }

  return (
    <Surface style={styles.container}>
      <Text style={styles.text}>
        📱 You are offline. Changes will sync when back online.
      </Text>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e1e1e',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#cf6679',
  },
  text: {
    color: '#cf6679',
    fontWeight: '500',
    fontSize: 14,
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export function NetworkStatusBar() {
  const { isOffline, type } = useNetworkStatus();

  if (!isOffline) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {type === 'none' 
          ? 'No network connection. Changes will be saved locally.'
          : 'Limited connectivity. Changes will be saved locally.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5a623',
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0a020',
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PendingChange, Task } from '@types';

interface Props {
  isConnected: boolean;
  pendingChanges: PendingChange<Task>[];
  onSync: () => void;
}

const NetworkStatusBar: React.FC<Props> = ({ isConnected, pendingChanges, onSync }) => {
  if (isConnected && pendingChanges.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {!isConnected && (
        <Text style={styles.text}>You are offline. Changes will sync when online.</Text>
      )}
      {isConnected && pendingChanges.length > 0 && (
        <View style={styles.syncContainer}>
          <Text style={styles.text}>
            {pendingChanges.length} pending change{pendingChanges.length !== 1 ? 's' : ''}
          </Text>
          <TouchableOpacity style={styles.syncButton} onPress={onSync}>
            <Text style={styles.syncButtonText}>Sync Now</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#666',
    padding: 10,
  },
  text: {
    color: '#fff',
    textAlign: 'center',
  },
  syncContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncButton: {
    marginLeft: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  syncButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
});

export default NetworkStatusBar;

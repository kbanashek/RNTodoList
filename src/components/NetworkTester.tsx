import React from "react";
import { View, StyleSheet } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import * as Network from "expo-network";
import { useNetworkStatus } from "../hooks/useNetworkStatus";

const NetworkTester: React.FC = () => {
  const theme = useTheme();
  const networkStatus = useNetworkStatus();

  const simulateOffline = async () => {
    // @ts-ignore - we're deliberately mocking the network state
    Network.getNetworkStateAsync = async () => ({
      isConnected: false,
      type: Network.NetworkStateType.NONE,
      isInternetReachable: false,
    });
  };

  const simulateOnlineNoInternet = async () => {
    // @ts-ignore - we're deliberately mocking the network state
    Network.getNetworkStateAsync = async () => ({
      isConnected: true,
      type: Network.NetworkStateType.WIFI,
      isInternetReachable: false,
    });
  };

  const simulateOnline = async () => {
    // @ts-ignore - we're deliberately mocking the network state
    Network.getNetworkStateAsync = async () => ({
      isConnected: true,
      type: Network.NetworkStateType.WIFI,
      isInternetReachable: true,
    });
  };

  if (!__DEV__) return null;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.surfaceVariant },
      ]}
    >
      <View style={styles.row}>
        <View>
          <Text variant="titleMedium">Network Status</Text>
          <Text>Connected: {networkStatus.isConnected ? "✓" : "✗"}</Text>
          <Text>Type: {networkStatus.connectionType}</Text>
          <Text>Internet: {networkStatus.isInternetReachable ? "✓" : "✗"}</Text>
          <Text variant="bodySmall">Last Check: {new Date(networkStatus.lastCheckTimestamp).toLocaleTimeString()}</Text>
        </View>
        <View style={styles.buttons}>
          <Button
            mode="contained-tonal"
            onPress={simulateOffline}
            style={styles.button}
          >
            Offline
          </Button>
          <Button 
            mode="contained-tonal"
            onPress={simulateOnlineNoInternet}
            style={styles.button}
          >
            No Internet
          </Button>
          <Button
            mode="contained-tonal"
            onPress={simulateOnline}
            style={styles.button}
          >
            Online
          </Button>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    margin: 12,
    marginTop: 0,
    borderRadius: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  buttons: {
    gap: 8,
  },
  button: {
    minWidth: 100,
  },
});

export default NetworkTester;

import React from "react";
import { StyleSheet } from "react-native";
import { Surface, Text } from "react-native-paper";
import { useNetworkStatus } from "../hooks/useNetworkStatus";

export const NetworkStatusBar: React.FC = () => {
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
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ccc",
    padding: 8,
    margin: 8,
    borderRadius: 4,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cf6679",
  },
  text: {
    color: "#cf6679",
    fontWeight: "500",
  },
});

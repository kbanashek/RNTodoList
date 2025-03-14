import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { useNetworkStatus } from "../hooks/useNetworkStatus";

interface NetworkStatusBarProps {
  style?: ViewStyle;
  onRetry?: () => void;
}

export const NetworkStatusBar: React.FC<NetworkStatusBarProps> = ({
  style,
  onRetry,
}) => {
  const { isConnected, connectionType, isInternetReachable } = useNetworkStatus();

  if (isConnected && isInternetReachable) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.text}>
        {!isConnected
          ? "No network connection"
          : !isInternetReachable
          ? `Connected to ${connectionType}, but no internet access`
          : ""}
      </Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ff6b6b",
    padding: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  retryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  retryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

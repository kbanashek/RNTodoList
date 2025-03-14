import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { useTasks } from "../hooks/useTasks";

interface StatusMessage {
  text: string;
  style: any;
  containerStyle: any;
}

export const NetworkStatusBar: React.FC = () => {
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const { tasks } = useTasks();

  const getStatusMessage = (): StatusMessage => {
    // Check for tasks with errors
    const errorTasks = tasks.filter((task) => task.syncStatus === "error");
    if (errorTasks.length > 0) {
      return {
        text: `Sync Error - ${errorTasks.length} task${
          errorTasks.length === 1 ? "" : "s"
        } failed`,
        style: styles.errorText,
        containerStyle: styles.errorContainer,
      };
    }

    // Check for pending tasks
    const pendingTasks = tasks.filter((task) => task.syncStatus === "pending");
    if (pendingTasks.length > 0) {
      return {
        text: `Syncing ${pendingTasks.length} task${
          pendingTasks.length === 1 ? "" : "s"
        }...`,
        style: styles.pendingText,
        containerStyle: styles.pendingContainer,
      };
    }

    // Show offline only when both connection and internet are down
    if (!isConnected && !isInternetReachable) {
      return {
        text: "Offline Mode - Changes saved locally",
        style: styles.offlineText,
        containerStyle: styles.offlineContainer,
      };
    }

    console.log(
      "isConnected:",
      isConnected,
      "isInternetReachable:",
      isInternetReachable
    );
    // Connected but no internet
    if (isConnected && !isInternetReachable) {
      return {
        text: "Limited Connectivity - Changes saved locally",
        style: styles.warningText,
        containerStyle: styles.warningContainer,
      };
    }

    // Online with good connection
    return {
      text: "Online - All changes synced",
      style: styles.onlineText,
      containerStyle: styles.onlineContainer,
    };
  };

  const status = getStatusMessage();

  return (
    <View style={[styles.container, status.containerStyle]}>
      <Text style={[styles.text, status.style]}>{status.text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  onlineContainer: {
    backgroundColor: "#E8F5E9",
    borderBottomColor: "#A5D6A7",
  },
  onlineText: {
    color: "#2E7D32",
  },
  offlineContainer: {
    backgroundColor: "#FFF3E0",
    borderBottomColor: "#FFCC80",
  },
  offlineText: {
    color: "#EF6C00",
  },
  warningContainer: {
    backgroundColor: "#FFF3E0",
    borderBottomColor: "#FFCC80",
  },
  warningText: {
    color: "#EF6C00",
  },
  pendingContainer: {
    backgroundColor: "#E3F2FD",
    borderBottomColor: "#90CAF9",
  },
  pendingText: {
    color: "#1565C0",
  },
  errorContainer: {
    backgroundColor: "#FFEBEE",
    borderBottomColor: "#EF9A9A",
  },
  errorText: {
    color: "#C62828",
  },
});

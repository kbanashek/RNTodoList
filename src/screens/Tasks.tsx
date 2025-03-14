import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
} from "react-native";
import {
  Button,
  Text,
  useTheme,
  ActivityIndicator,
  MD3Theme,
  IconButton,
  Badge,
} from "react-native-paper";
import * as Network from "expo-network";
import TaskInput from "../components/TaskInput";
import TaskList from "../components/TaskList";
import NetworkTester from "../components/NetworkTester";
import { useTodos } from "../hooks/useTodos";
import { useNetworkStatus } from "../hooks/useServiceCheck";
import { todoService } from "../services/todoService";

const Tasks: React.FC = () => {
  const theme = useTheme();
  const { isLoading, error, refetch } = useTodos();
  const { isConnected, type, isInternetReachable } = useNetworkStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(0);
  const spinValue = useRef(new Animated.Value(0)).current;

  const startSpinAnimation = useCallback(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [spinValue]);

  const stopSpinAnimation = useCallback(() => {
    spinValue.stopAnimation();
    spinValue.setValue(0);
  }, [spinValue]);

  useEffect(() => {
    if (isSyncing) {
      startSpinAnimation();
    } else {
      stopSpinAnimation();
    }
  }, [isSyncing, startSpinAnimation, stopSpinAnimation]);

  const checkPendingChanges = useCallback(async () => {
    const changes = await todoService.getPendingChanges();
    setPendingChanges(changes.length);
  }, []);

  useEffect(() => {
    checkPendingChanges();
  }, [checkPendingChanges]);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleSync = useCallback(async () => {
    if (!isConnected || !isInternetReachable || isSyncing) return;
    setIsSyncing(true);
    try {
      await todoService.syncPendingChanges();
      await refetch();
      await checkPendingChanges();
    } catch (error) {
      console.error("Error syncing:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [isConnected, isInternetReachable, isSyncing, refetch, checkPendingChanges]);

  useEffect(() => {
    if (isConnected && isInternetReachable && pendingChanges > 0) {
      handleSync();
    }
  }, [isConnected, isInternetReachable, pendingChanges, handleSync]);

  const getConnectionType = () => {
    switch (type) {
      case Network.NetworkStateType.WIFI:
        return "WiFi";
      case Network.NetworkStateType.CELLULAR:
        return "Cellular";
      case Network.NetworkStateType.BLUETOOTH:
        return "Bluetooth";
      case Network.NetworkStateType.ETHERNET:
        return "Ethernet";
      case Network.NetworkStateType.VPN:
        return "VPN";
      case Network.NetworkStateType.NONE:
      default:
        return "No Connection";
    }
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text>Loading tasks...</Text>
        </View>
      );
    }

    const renderTasks = () => (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <TaskInput />
          <TaskList />
        </View>
      </KeyboardAvoidingView>
    );

    if (!isConnected) {
      return (
        <>
          <View
            style={[
              styles.banner,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          >
            <Text style={styles.message}>No network connection</Text>
            <Text style={styles.submessage}>Working in offline mode</Text>
            <Text style={styles.detail}>
              {pendingChanges > 0
                ? `${pendingChanges} change${
                    pendingChanges === 1 ? "" : "s"
                  } pending sync`
                : "Your changes will sync when connection is restored"}
            </Text>
          </View>
          {renderTasks()}
        </>
      );
    }

    if (!isInternetReachable) {
      return (
        <>
          <View
            style={[
              styles.banner,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          >
            <Text style={styles.message}>Internet not reachable</Text>
            <Text style={styles.submessage}>
              Connected to {getConnectionType()}
            </Text>
            <Text style={styles.detail}>Check your internet connection</Text>
            <Button
              mode="contained"
              onPress={handleRetry}
              style={styles.button}
              labelStyle={styles.buttonLabel}
            >
              Retry
            </Button>
          </View>
          {renderTasks()}
        </>
      );
    }

    if (error) {
      return (
        <>
          <View
            style={[
              styles.banner,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          >
            <Text style={styles.message}>Error loading tasks</Text>
            <Text style={styles.detail}>
              {error instanceof Error ? error.message : "Unknown error"}
            </Text>
            <Button
              mode="contained"
              onPress={handleRetry}
              style={styles.button}
              labelStyle={styles.buttonLabel}
            >
              Retry
            </Button>
          </View>
          {renderTasks()}
        </>
      );
    }

    return renderTasks();
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
    >
      {__DEV__ && <NetworkTester />}
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
        <View style={styles.headerRight}>
          {isConnected && isInternetReachable && (
            <>
              {pendingChanges > 0 && !isSyncing && (
                <Badge style={styles.badge}>{pendingChanges}</Badge>
              )}
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <IconButton
                  icon={isSyncing ? "sync" : pendingChanges > 0 ? "sync-alert" : "sync"}
                  iconColor={theme.colors.primary}
                  size={24}
                  onPress={handleSync}
                  disabled={isSyncing}
                  style={styles.syncButton}
                />
              </Animated.View>
            </>
          )}
        </View>
      </View>
      {renderContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  banner: {
    padding: 16,
    alignItems: "center",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  message: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  submessage: {
    fontSize: 16,
    marginBottom: 8,
  },
  detail: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
    marginBottom: 16,
  },
  buttonLabel: {
    fontSize: 16,
    paddingHorizontal: 8,
  },
  syncButton: {
    margin: 0,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    zIndex: 1,
  },
});

export default Tasks;

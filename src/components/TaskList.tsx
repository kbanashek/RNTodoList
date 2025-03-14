import React from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { Task } from "../store/types";
import { TaskListItem } from "./TaskListItem";

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  error: Error | null;
  onToggleComplete: (taskId: string, completed: boolean) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (taskId: string, title: string) => void;
}

export function TaskList({
  tasks,
  isLoading,
  error,
  onToggleComplete,
  onDeleteTask,
  onEditTask,
}: TaskListProps) {
  const renderItem = ({ item }: { item: Task }) => (
    <TaskListItem
      task={item}
      onToggleComplete={onToggleComplete}
      onDeleteTask={onDeleteTask}
      onEditTask={onEditTask}
    />
  );

  if (isLoading && tasks.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading tasks...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.refreshIndicator}>
          <ActivityIndicator size="small" />
          <Text style={styles.refreshText}>Refreshing...</Text>
        </View>
      )}
      <FlatList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 16,
    textAlign: "center",
    margin: 20,
  },
  refreshIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    backgroundColor: "#f5f5f5",
  },
  refreshText: {
    marginLeft: 10,
    color: "#666",
    fontSize: 14,
  },
});

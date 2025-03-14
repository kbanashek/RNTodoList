import React from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
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
        <ActivityIndicator animating size="large" color="#bb86fc" />
        <Text style={styles.messageText}>Loading tasks...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={[styles.messageText, styles.errorText]}>
          Error: {error.message}
        </Text>
      </View>
    );
  }

  if (tasks.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.messageText}>
          No tasks yet. Add your first task above!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.refreshIndicator}>
          <ActivityIndicator size="small" color="#bb86fc" />
          <Text style={styles.refreshText}>Refreshing...</Text>
        </View>
      )}
      <FlatList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
    padding: 20,
  },
  listContent: {
    flexGrow: 1,
    paddingTop: 8,
    paddingBottom: 20,
  },
  refreshIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    backgroundColor: '#1e1e1e',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 4,
    elevation: 2,
  },
  messageText: {
    marginTop: 8,
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
  errorText: {
    color: '#cf6679',
  },
  refreshText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#ffffff',
  },
});

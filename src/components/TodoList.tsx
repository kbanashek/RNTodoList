import React from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import { Task } from "../store/types";
import { TodoListItem } from "./TodoListItem";

interface TodoListProps {
  tasks: Task[];
  isLoading: boolean;
  loadingTaskIds: string[];
  error: string | null;
  onToggleComplete: (taskId: string, completed: boolean) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (taskId: string, title: string) => void;
}

export const TodoList: React.FC<TodoListProps> = ({
  tasks,
  isLoading,
  loadingTaskIds,
  error,
  onToggleComplete,
  onDeleteTask,
  onEditTask,
}) => {
  if (isLoading && tasks.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#bb86fc" />
        <Text style={styles.messageText}>Loading tasks...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={[styles.messageText, styles.errorText]}>
          Error: {error}
        </Text>
      </View>
    );
  }

  if (tasks.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No tasks yet. Add one above!</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={tasks}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TodoListItem
          task={item}
          isLoading={loadingTaskIds.includes(item.id)}
          onToggleComplete={onToggleComplete}
          onDeleteTask={onDeleteTask}
          onEditTask={onEditTask}
        />
      )}
      style={styles.list}
      contentContainerStyle={styles.listContent}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 16,
  },
  messageText: {
    marginTop: 8,
    fontSize: 16,
    color: "#ffffff",
    textAlign: "center",
  },
  errorText: {
    color: "#cf6679",
  },
});

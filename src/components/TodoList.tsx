import React from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import { Todo } from "../store/types";
import { TodoListItem } from "./TodoListItem";

interface TodoListProps {
  todos: Todo[];
  isLoading: boolean;
  loadingTodoIds: Set<string>;
  error: Error | null;
  onToggleComplete: (todoId: string, completed: boolean) => void;
  onDeleteTodo: (todoId: string) => void;
  onEditTodo: (todoId: string, title: string) => void;
}

export function TodoList({
  todos,
  isLoading,
  loadingTodoIds,
  error,
  onToggleComplete,
  onDeleteTodo,
  onEditTodo,
}: TodoListProps) {
  if (isLoading && todos.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#bb86fc" />
        <Text style={styles.messageText}>Loading todos...</Text>
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

  if (todos.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No todos yet. Add one above!</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={todos}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TodoListItem
          todo={item}
          isLoading={loadingTodoIds.has(item.id)}
          onToggleComplete={onToggleComplete}
          onDeleteTodo={onDeleteTodo}
          onEditTodo={onEditTodo}
        />
      )}
      style={styles.list}
      contentContainerStyle={styles.listContent}
    />
  );
}

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

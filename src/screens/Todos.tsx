import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { AddTodoForm } from "../components/AddTodoForm";
import { NetworkStatusBar } from "../components/NetworkStatusBar";
import { TodoList } from "../components/TodoList";
import { useTodos } from "../hooks/useTodos";

export function Todos() {
  const {
    todos,
    isLoading,
    loadingTodoIds,
    error,
    addTodo,
    editTodo,
    deleteTodo,
  } = useTodos();

  return (
    <View style={styles.container}>
      <NetworkStatusBar />
      <View style={styles.header}>
        <Text style={styles.title}>Todo List</Text>
        <AddTodoForm onSubmit={addTodo} isLoading={isLoading} />
      </View>
      <TodoList
        todos={todos}
        isLoading={isLoading}
        loadingTodoIds={loadingTodoIds}
        error={error}
        onToggleComplete={(todoId, completed) =>
          editTodo(todoId, { completed })
        }
        onDeleteTodo={deleteTodo}
        onEditTodo={(todoId, title) => editTodo(todoId, { title })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    padding: 16,
    paddingTop: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 16,
  },
});

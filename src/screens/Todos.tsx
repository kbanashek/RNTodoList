import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { AddTodoForm } from "../components/AddTodoForm";
import { TodoList } from "../components/TodoList";
import { useTodos } from "../hooks/useTodos";

export function Todos() {
  const { tasks, isLoading, error, addTask, editTask, deleteTask } = useTodos();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Todo List</Text>
        <AddTodoForm onSubmit={addTask} />
      </View>
      <TodoList
        tasks={tasks}
        isLoading={isLoading}
        loadingTaskIds={new Set()}
        error={error}
        onToggleComplete={(taskId: string, completed: boolean) =>
          editTask(taskId, { completed })
        }
        onDeleteTask={(taskId: string) => deleteTask(taskId)}
        onEditTask={(taskId: string, title: string) =>
          editTask(taskId, { title })
        }
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

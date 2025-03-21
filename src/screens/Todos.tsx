import React from 'react';
import { StyleSheet, View, Button, Alert } from 'react-native';
import { Text, Snackbar } from 'react-native-paper';
import { AddTodoForm } from '../components/AddTodoForm';
import { TodoList } from '../components/TodoList';
import { useTodos } from '../hooks/todos/useTodos';
import { TodoStorage } from '../storage/todoStorage';
import * as FileSystem from 'expo-file-system';

export const Todos: React.FC = () => {
  const {
    tasks,
    isLoading,
    loadingTaskIds,
    error,
    addTodo,
    editTodo,
    deleteTodo,
    exportTodosAsJson,
    snackbarProps,
  } = useTodos();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Todo List</Text>
        <AddTodoForm onSubmit={addTodo} />
      </View>
      <TodoList
        tasks={tasks}
        isLoading={isLoading}
        loadingTaskIds={loadingTaskIds}
        error={error}
        onToggleComplete={(taskId: string, completed: boolean) => editTodo(taskId, { completed })}
        onDeleteTask={(taskId: string) => deleteTodo(taskId)}
        onEditTask={(taskId: string, title: string) => editTodo(taskId, { title })}
      />
      {__DEV__ && (
        <View style={styles.devTools}>
          <Button title="Export Todos as JSON" onPress={exportTodosAsJson} color="#666" />
        </View>
      )}
      <Snackbar {...snackbarProps} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    padding: 16,
    paddingTop: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  devTools: {
    padding: 16,
    backgroundColor: '#333',
    alignItems: 'center',
  },
});

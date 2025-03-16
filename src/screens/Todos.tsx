import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { AddTodoForm } from '../components/AddTodoForm';
import { TodoList } from '../components/TodoList';
import { useTodos } from '../hooks/useTodos';

export const Todos: React.FC = () => {
  const { tasks, isLoading, loadingTaskIds, error, addTodo, editTodo, deleteTodo } = useTodos();

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
});

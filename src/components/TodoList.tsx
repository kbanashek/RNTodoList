import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { Todo } from '../store/types';
import { TodoListItem } from './TodoListItem';

interface TodoListProps {
  tasks: Todo[];
  isLoading: boolean;
  loadingTaskIds: string[];
  error: string | null;
  onToggleComplete: (taskId: string, completed: boolean) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (taskId: string, title: string) => void;
  onUpdateDueDate: (taskId: string, dueDate: string | null) => void;
}

export const TodoList: React.FC<TodoListProps> = ({
  tasks,
  isLoading,
  loadingTaskIds,
  error,
  onToggleComplete,
  onDeleteTask,
  onEditTask,
  onUpdateDueDate,
}) => {
  if (isLoading && tasks.length === 0) {
    return (
      <View style={styles.centerContainer} testID="loading-container">
        <ActivityIndicator size="large" color="#bb86fc" />
        <Text style={styles.messageText} testID="loading-text">
          Loading tasks...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer} testID="error-container">
        <Text style={[styles.messageText, styles.errorText]} testID="error-text">
          Error: {error}
        </Text>
      </View>
    );
  }

  if (tasks.length === 0) {
    return (
      <View style={styles.centerContainer} testID="empty-container">
        <Text style={styles.emptyText} testID="empty-text">
          No tasks yet. Add one above!
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      testID="todo-list"
      data={tasks}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <TodoListItem
          task={item}
          isLoading={loadingTaskIds.includes(item.id)}
          onToggleComplete={onToggleComplete}
          onDeleteTask={onDeleteTask}
          onEditTask={onEditTask}
          onUpdateDueDate={onUpdateDueDate}
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
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
});

import React from 'react';
import { View, FlatList, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Task } from '../store/types';
import { TaskListItem } from './TaskListItem';
import { Button } from './Button';

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  error: Error | null;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onRetry: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  isLoading,
  error,
  onToggle,
  onDelete,
  onEdit,
  onRetry,
}) => {
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading tasks...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
        <Button title="Retry" onPress={onRetry} style={styles.retryButton} />
      </View>
    );
  }

  if (tasks.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No tasks yet</Text>
        <Text style={styles.emptySubtext}>Add a task to get started</Text>
      </View>
    );
  }

  const pendingTasks = tasks.filter(task => task.syncStatus === 'pending');
  const errorTasks = tasks.filter(task => task.syncStatus === 'error');

  return (
    <FlatList
      data={tasks}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <TaskListItem
          task={item}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      )}
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListHeaderComponent={
        (pendingTasks.length > 0 || errorTasks.length > 0) ? (
          <View style={styles.statusContainer}>
            {pendingTasks.length > 0 && (
              <Text style={styles.pendingText}>
                {pendingTasks.length} task{pendingTasks.length !== 1 ? 's' : ''} pending sync
              </Text>
            )}
            {errorTasks.length > 0 && (
              <Text style={styles.errorStatusText}>
                {errorTasks.length} task{errorTasks.length !== 1 ? 's' : ''} failed to sync
              </Text>
            )}
          </View>
        ) : null
      }
    />
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32, 
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    marginTop: 16,
  },
  separator: {
    height: 8,
  },
  statusContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pendingText: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4,
  },
  errorStatusText: {
    fontSize: 14,
    color: '#FF3B30',
  },
});

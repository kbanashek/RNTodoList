import React from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { Task } from '@types';
import { TaskListItem } from './TaskListItem';

interface TaskListProps {
  tasks: Task[];
  isLoading?: boolean;
  error?: string | null;
  onToggleTask: (taskId: string) => Promise<void>;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => Promise<void>;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  isLoading,
  error,
  onToggleTask,
  onEditTask,
  onDeleteTask,
}) => {
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
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

  const renderItem = ({ item }: { item: Task }) => (
    <TaskListItem
      task={item}
      onToggle={onToggleTask}
      onEdit={onEditTask}
      onDelete={onDeleteTask}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        bounces={true}
        removeClippedSubviews={true}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={50}
        windowSize={3}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  list: {
    padding: 16,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    textAlign: 'center',
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
});

export default TaskList;

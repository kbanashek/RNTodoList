import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { Task } from '@types';
import TaskListItem from './TaskListItem';
import { useNetworkStatus } from '../hooks/useServiceCheck';

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  isOffline: boolean;
  onToggleComplete: (taskId: string, completed: boolean) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (taskId: string, updates: Partial<Task>) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  isLoading,
  isOffline,
  onToggleComplete,
  onDeleteTask,
  onEditTask,
}) => {
  const { type: networkType } = useNetworkStatus();

  const renderItem = ({ item }: { item: Task }) => (
    <TaskListItem
      task={item}
      isOffline={isOffline}
      onToggleComplete={onToggleComplete}
      onDelete={onDeleteTask}
      onEdit={onEditTask}
    />
  );

  if (isLoading && !tasks.length) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
        contentContainerStyle={styles.content}
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
  },
  list: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingVertical: 8,
  },
});

export default TaskList;

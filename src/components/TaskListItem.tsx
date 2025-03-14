import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Task } from '../types/index';
import { Button } from './Button';
import { useAppSelector } from '../store';

interface TaskListItemProps {
  task: Task;
  onToggle: (taskId: string) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onEdit: (task: Task) => void;
}

export const TaskListItem: React.FC<TaskListItemProps> = ({
  task,
  onToggle,
  onDelete,
  onEdit,
}) => {
  const { isConnected } = useAppSelector(state => state.network);

  const getSyncIndicator = () => {
    if (!isConnected) {
      return {
        style: styles.offlineIndicator,
        text: 'Offline',
      };
    }
    switch (task?.syncStatus) {
      case 'pending':
        return {
          style: styles.syncIndicator,
          text: 'Syncing...',
        };
      case 'error':
        return {
          style: styles.errorIndicator,
          text: task.error || 'Sync failed',
        };
      default:
        return null;
    }
  };

  const syncIndicator = getSyncIndicator();

  if (!task?.id || !task?.title) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.taskContent}
        onPress={() => onToggle(task.id)}
      >
        <View style={[styles.checkbox, task.completed && styles.checked]} />
        <View style={styles.textContainer}>
          <Text 
            style={[styles.title, task.completed && styles.completedTitle]}
            numberOfLines={2}
          >
            {String(task.title)}
          </Text>
          {task.error && (
            <Text style={styles.errorText} numberOfLines={1}>
              {String(task.error)}
            </Text>
          )}
        </View>
      </TouchableOpacity>
      <View style={styles.actions}>
        <Button
          title="Edit"
          onPress={() => onEdit(task)}
          style={styles.editButton}
          disabled={task.syncStatus === 'pending'}
        />
        <Button
          title="Delete"
          onPress={() => onDelete(task.id)}
          style={styles.deleteButton}
          disabled={task.syncStatus === 'pending'}
        />
      </View>
      {syncIndicator && (
        <View style={syncIndicator.style}>
          <Text style={styles.indicatorText}>{syncIndicator.text}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 12,
  },
  checked: {
    backgroundColor: '#007AFF',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: '#333',
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  editButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  syncIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#4dabf7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  offlineIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#868e96',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  errorIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  indicatorText: {
    color: '#fff',
    fontSize: 12,
  },
});

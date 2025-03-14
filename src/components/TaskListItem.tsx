import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Task } from '../store/types';

interface TaskListItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
}

export const TaskListItem: React.FC<TaskListItemProps> = ({
  task,
  onToggle,
  onDelete,
  onEdit,
}) => {
  const getSyncStatusColor = () => {
    switch (task.syncStatus) {
      case 'pending':
        return '#007AFF';
      case 'error':
        return '#FF3B30';
      default:
        return '#34C759';
    }
  };

  const getSyncStatusText = () => {
    switch (task.syncStatus) {
      case 'pending':
        return 'Saving...';
      case 'error':
        return 'Failed to save';
      default:
        return 'Saved';
    }
  };

  return (
    <View style={[styles.container, task.syncStatus === 'error' && styles.errorContainer]}>
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => onToggle(task.id)}
        disabled={task.syncStatus === 'pending'}
      >
        <View style={[
          styles.checkbox,
          task.completed && styles.checkboxChecked,
          task.syncStatus === 'pending' && styles.checkboxDisabled,
        ]}>
          {task.syncStatus === 'pending' && (
            <ActivityIndicator size="small" color="#007AFF" style={styles.spinner} />
          )}
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.content}
        onPress={() => onEdit(task)}
        disabled={task.syncStatus === 'pending'}
      >
        <Text
          style={[
            styles.title,
            task.completed && styles.titleCompleted,
            task.syncStatus === 'pending' && styles.titlePending,
          ]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
        <View style={styles.statusContainer}>
          <Text style={[styles.syncStatus, { color: getSyncStatusColor() }]}>
            {getSyncStatusText()}
          </Text>
          {task.syncStatus === 'error' && task.error && (
            <Text style={styles.errorText} numberOfLines={1}>
              {task.error}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.deleteButton,
          task.syncStatus === 'pending' && styles.deleteButtonDisabled
        ]}
        onPress={() => onDelete(task.id)}
        disabled={task.syncStatus === 'pending'}
      >
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  errorContainer: {
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  toggleButton: {
    padding: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkboxDisabled: {
    borderColor: '#999',
    backgroundColor: '#f5f5f5',
  },
  spinner: {
    marginTop: -8,
  },
  content: {
    flex: 1,
    marginHorizontal: 12,
  },
  title: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  titlePending: {
    color: '#999',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginLeft: 8,
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FF3B30',
    borderRadius: 4,
  },
  deleteButtonDisabled: {
    backgroundColor: '#999',
  },
  deleteText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

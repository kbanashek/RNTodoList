import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ViewStyle } from 'react-native';
import { Task } from '../store/types';
import { Button } from './Button';

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
  const isPending = task.syncStatus === 'pending';
  const isError = task.syncStatus === 'error';
  const showSyncIndicator = isPending || isError;

  const handleToggle = () => {
    if (!isPending) onToggle(task.id);
  };

  const handleDelete = () => {
    if (!isPending) onDelete(task.id);
  };

  const handleEdit = () => {
    if (!isPending) onEdit(task);
  };

  const getEditButtonStyle = (): ViewStyle => ({
    ...styles.editButton,
    ...(isError ? styles.editButtonError : {}),
  });

  return (
    <View style={[styles.container, isError && styles.errorContainer]}>
      <TouchableOpacity
        style={styles.content}
        onPress={handleToggle}
        disabled={isPending}
      >
        <View style={styles.checkboxContainer}>
          <View style={[
            styles.checkbox,
            task.completed && styles.checkboxChecked,
            isPending && styles.checkboxDisabled,
          ]}>
            {task.completed && !isPending && <Text style={styles.checkmark}>✓</Text>}
            {isPending && <ActivityIndicator size="small" color="#999" />}
          </View>
        </View>
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              task.completed && styles.titleCompleted,
              isPending && styles.titlePending,
            ]}
            numberOfLines={2}
          >
            {task.title}
          </Text>
          {showSyncIndicator && (
            <View style={styles.statusContainer}>
              {isPending ? (
                <View style={styles.statusRow}>
                  <Text style={styles.savingText}>Saving changes...</Text>
                </View>
              ) : isError ? (
                <View style={styles.statusRow}>
                  <Text style={styles.errorText}>Failed to save - </Text>
                  <TouchableOpacity onPress={handleEdit}>
                    <Text style={styles.retryText}>Tap to retry</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          )}
        </View>
      </TouchableOpacity>
      <View style={styles.actions}>
        {!isPending && (
          <>
            <Button
              title="Edit"
              onPress={handleEdit}
              style={getEditButtonStyle()}
            />
            <Button
              title="Delete"
              onPress={handleDelete}
              style={styles.deleteButton}
            />
          </>
        )}
      </View>
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
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxContainer: {
    marginRight: 12,
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
  },
  checkboxDisabled: {
    borderColor: '#999',
    backgroundColor: '#f0f0f0',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: '#333',
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  titlePending: {
    color: '#999',
  },
  statusContainer: {
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savingText: {
    fontSize: 12,
    color: '#007AFF',
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
  },
  retryText: {
    fontSize: 12,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  actions: {
    flexDirection: 'row',
    marginLeft: 12,
  },
  editButton: {
    backgroundColor: '#007AFF',
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editButtonError: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});

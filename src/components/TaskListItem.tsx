import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Text, Checkbox, IconButton } from 'react-native-paper';
import { Task } from '@types';

interface TaskListItemProps {
  task: Task;
  isOffline: boolean;
  onToggleComplete: (taskId: string, completed: boolean) => void;
  onDelete: (taskId: string) => void;
  onEdit: (taskId: string, updates: Partial<Task>) => void;
}

const TaskListItem: React.FC<TaskListItemProps> = ({
  task,
  isOffline,
  onToggleComplete,
  onDelete,
  onEdit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.title);
  const fadeAnim = useState(new Animated.Value(1))[0];

  const handleStartEditing = useCallback(() => {
    setEditText(task.title);
    setIsEditing(true);
  }, [task.title]);

  const handleCancelEditing = useCallback(() => {
    setIsEditing(false);
    setEditText(task.title);
  }, [task.title]);

  const handleSubmitEditing = useCallback(() => {
    const trimmedText = editText.trim();
    if (trimmedText && trimmedText !== task.title) {
      onEdit(task.id, { title: trimmedText });
    }
    setIsEditing(false);
  }, [editText, task.id, task.title, onEdit]);

  const handleToggleComplete = useCallback(() => {
    onToggleComplete(task.id, !task.completed);
  }, [task.id, task.completed, onToggleComplete]);

  const handleDelete = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onDelete(task.id);
    });
  }, [fadeAnim, task.id, onDelete]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        <Checkbox
          status={task.completed ? 'checked' : 'unchecked'}
          onPress={handleToggleComplete}
          disabled={isOffline}
        />
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={editText}
            onChangeText={setEditText}
            onBlur={handleCancelEditing}
            onSubmitEditing={handleSubmitEditing}
            autoFocus
          />
        ) : (
          <TouchableOpacity
            style={styles.textContainer}
            onPress={handleStartEditing}
            disabled={isOffline}
          >
            <Text
              style={[
                styles.text,
                task.completed && styles.completedText,
                task.syncStatus === 'pending' && styles.pendingText,
                task.syncStatus === 'error' && styles.errorText,
              ]}
              numberOfLines={2}
            >
              {task.title}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.actions}>
        {task.syncStatus === 'error' && (
          <IconButton
            icon="alert-circle"
            size={20}
            iconColor="#f44336"
            onPress={() => {}}
          />
        )}
        {task.syncStatus === 'pending' && (
          <IconButton
            icon="clock-outline"
            size={20}
            iconColor="#fb8c00"
            onPress={() => {}}
          />
        )}
        <IconButton
          icon="delete"
          size={20}
          onPress={handleDelete}
          disabled={isOffline}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 8,
  },
  text: {
    fontSize: 16,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#9e9e9e',
  },
  pendingText: {
    color: '#fb8c00',
  },
  errorText: {
    color: '#f44336',
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    padding: 0,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default TaskListItem;

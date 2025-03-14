import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Button } from './Button';
import { Task } from '../store/types';

interface AddTaskFormProps {
  onSubmit: (title: string) => Promise<void>;
  editingTask: Task | null;
  onSaveEdit: (taskId: string, title: string) => Promise<void>;
  onCancelEdit: () => void;
}

export const AddTaskForm: React.FC<AddTaskFormProps> = ({
  onSubmit,
  editingTask,
  onSaveEdit,
  onCancelEdit,
}) => {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
    } else {
      setTitle('');
    }
  }, [editingTask]);

  const handleSubmit = async () => {
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);
      if (editingTask) {
        await onSaveEdit(editingTask.id, title.trim());
      } else {
        await onSubmit(title.trim());
      }
      setTitle('');
    } catch (error) {
      console.error('Error submitting task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    onCancelEdit();
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder={editingTask ? 'Edit task...' : 'Add a new task...'}
        placeholderTextColor="#999"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
        editable={!isSubmitting}
        autoFocus={!!editingTask}
      />
      <View style={styles.buttons}>
        {editingTask ? (
          <>
            <Button
              title="Cancel"
              onPress={handleCancel}
              style={styles.cancelButton}
              disabled={isSubmitting}
            />
            <Button
              title="Save"
              onPress={handleSubmit}
              style={styles.saveButton}
              disabled={!title.trim() || isSubmitting}
            />
          </>
        ) : (
          <Button
            title="Add Task"
            onPress={handleSubmit}
            style={styles.addButton}
            disabled={!title.trim() || isSubmitting}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    minWidth: 100,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    minWidth: 100,
  },
  cancelButton: {
    backgroundColor: '#999',
    marginRight: 8,
    minWidth: 100,
  },
});

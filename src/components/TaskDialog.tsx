import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Task } from '../store/types';
import { Button } from './Button';

interface TaskDialogProps {
  visible: boolean;
  task?: Task | null;
  onClose: () => void;
  onSubmit: (title: string) => Promise<void>;
}

export const TaskDialog: React.FC<TaskDialogProps> = ({
  visible,
  task,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && task) {
      setTitle(task.title);
    } else if (!visible) {
      setTitle('');
      setError(null);
    }
  }, [visible, task]);

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Task title is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit(trimmedTitle);
      setTitle('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.overlay}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 44 : 0}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>
                {task ? 'Edit Task' : 'Add Task'}
              </Text>
            </View>

            <TextInput
              style={styles.input}
              value={title}
              onChangeText={text => {
                setTitle(text);
                setError(null);
              }}
              placeholder="Enter task title"
              autoFocus
              maxLength={100}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              editable={!isSubmitting}
            />

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            <View style={styles.buttonContainer}>
              <Button
                title="Cancel"
                onPress={onClose}
                style={styles.cancelButton}
                disabled={isSubmitting}
              />
              <Button
                title={task ? (isSubmitting ? 'Saving...' : 'Update') : (isSubmitting ? 'Adding...' : 'Add')}
                onPress={handleSubmit}
                style={styles.submitButton}
                disabled={isSubmitting}
                loading={isSubmitting}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#8E8E93',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
});

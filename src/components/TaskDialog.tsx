import React, { useState, useCallback, useEffect } from 'react';
import { View, TextInput, Modal, StyleSheet, Text, ViewStyle } from 'react-native';
import { Button } from './Button';

interface TaskDialogProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (title: string) => Promise<void>;
  initialTitle?: string;
  mode: 'add' | 'edit';
}

export const TaskDialog: React.FC<TaskDialogProps> = ({
  visible,
  onClose,
  onSubmit,
  initialTitle = '',
  mode,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle]);

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) return;
    try {
      setIsSubmitting(true);
      await onSubmit(title.trim());
      setTitle('');
      onClose();
    } catch (error) {
      console.error('Failed to submit task:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [title, onSubmit, onClose]);

  const submitButtonStyle: ViewStyle = {
    ...styles.button,
    backgroundColor: '#007AFF',
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>
            {mode === 'add' ? 'Add Task' : 'Edit Task'}
          </Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter task title"
            autoFocus
            maxLength={100}
          />
          <View style={styles.buttonContainer}>
            <Button
              title="Cancel"
              onPress={onClose}
              style={styles.button}
              disabled={isSubmitting}
            />
            <Button
              title={isSubmitting ? 'Saving...' : 'Save'}
              onPress={handleSubmit}
              style={submitButtonStyle}
              disabled={isSubmitting || !title.trim()}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    width: '90%',
    maxWidth: 400,
  } as ViewStyle,
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  } as ViewStyle,
  button: {
    marginLeft: 8,
  } as ViewStyle,
});

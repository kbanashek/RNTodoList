import React, { useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Card, TextInput, Text, ActivityIndicator, IconButton } from 'react-native-paper';
import { Todo } from '../store/types';

interface TodoListItemProps {
  task: Todo;
  isLoading?: boolean;
  onToggleComplete: (taskId: string, completed: boolean) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (taskId: string, title: string) => void;
}

export const TodoListItem = ({
  task,
  isLoading,
  onToggleComplete,
  onDeleteTask,
  onEditTask,
}: TodoListItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);

  const handleSave = () => {
    const trimmedTitle = editedTitle.trim();
    if (trimmedTitle && trimmedTitle !== task.title) {
      onEditTask(task.id, trimmedTitle);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(task.title);
    setIsEditing(false);
  };

  return (
    <Card style={styles.container}>
      <View style={styles.content}>
        <View
          style={[styles.checkboxContainer, task.completed && styles.checkboxContainerCompleted]}
        >
          {isLoading ? (
            <ActivityIndicator size={20} color="#bb86fc" />
          ) : (
            <IconButton
              icon={task.completed ? 'check-circle-outline' : 'circle-outline'}
              onPress={() => !isLoading && onToggleComplete(task.id, !task.completed)}
              iconColor={task.completed ? '#bb86fc' : 'rgba(255, 255, 255, 0.7)'}
              size={36}
              disabled={isLoading}
            />
          )}
        </View>
        <View style={styles.middleContent}>
          {isEditing ? (
            <TextInput
              value={editedTitle}
              onChangeText={setEditedTitle}
              onSubmitEditing={handleSave}
              style={styles.input}
              mode="flat"
              autoFocus
              textColor="#ffffff"
              underlineColor="transparent"
              activeUnderlineColor="#bb86fc"
              disabled={isLoading}
              right={
                <TextInput.Icon
                  icon="check"
                  onPress={handleSave}
                  disabled={isLoading || !editedTitle.trim() || editedTitle.trim() === task.title}
                  color={
                    isLoading || !editedTitle.trim() || editedTitle.trim() === task.title
                      ? 'rgba(255, 255, 255, 0.3)'
                      : '#bb86fc'
                  }
                />
              }
            />
          ) : (
            <Text
              style={[
                styles.title,
                task.completed && styles.completedTitle,
                isLoading && styles.loadingTitle,
              ]}
              numberOfLines={2}
            >
              {task.title}
            </Text>
          )}
        </View>
        <View style={styles.actions}>
          {isEditing ? (
            <Pressable onPress={handleCancel} style={{ width: 20, height: 20 }}>
              <Text
                style={{
                  position: 'absolute',
                  color: '#cf6679',
                  fontSize: 16,
                  top: 0,
                  left: 0,
                  fontWeight: '600',
                }}
              >
                ×
              </Text>
            </Pressable>
          ) : (
            <>
              <IconButton
                icon="pencil"
                onPress={() => setIsEditing(true)}
                iconColor="#bb86fc"
                size={20}
                disabled={isLoading}
              />
              <IconButton
                icon="delete"
                onPress={() => onDeleteTask(task.id)}
                iconColor="#cf6679"
                size={20}
                disabled={isLoading}
              />
            </>
          )}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 4,
    backgroundColor: '#333333',
    elevation: 2,
    borderRadius: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  checkboxContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  checkboxContainerCompleted: {
    // borderColor: "#bb86fc",
    // backgroundColor: "rgba(187, 134, 252, 0.15)",
  },
  middleContent: {
    flex: 1,
    marginHorizontal: 8,
  },
  title: {
    fontSize: 16,
    color: '#ffffff',
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  loadingTitle: {
    opacity: 0.5,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

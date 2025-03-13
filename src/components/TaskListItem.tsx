import React, { useState } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Text, useTheme, Button } from "react-native-paper";
import type { Task } from "../store/taskSlice";

export interface TaskListItemProps {
  task: Task;

  isEditing: boolean;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onSave: (id: string, text: string) => void;
}

const TaskListItem = ({
  task,
  isEditing,
  onDelete,
  onEdit,
  onSave,
}: TaskListItemProps) => {
  const [editText, setEditText] = useState(task.text);
  const theme = useTheme();

  const handleSave = () => {
    const trimmedText = editText.trim();
    if (trimmedText) {
      onSave(task.id, trimmedText);
    }
  };

  return (
    <View
      style={[
        styles.taskItem,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
        },
      ]}
    >
      {isEditing ? (
        <View>
          <TextInput
            testID="edit-input"
            style={[
              styles.taskTextEdit,
              {
                borderColor: theme.colors.outline,
                backgroundColor: theme.colors.background,
                color: theme.colors.onBackground,
              },
            ]}
            value={editText}
            onChangeText={setEditText}
            autoFocus
          />
          <Button
            testID="save-button"
            mode="contained"
            onPress={handleSave}
            style={styles.actionButton}
          >
            Save
          </Button>
        </View>
      ) : (
        <View>
          <Text variant="bodyLarge" style={styles.taskText}>
            {task.text}
          </Text>
          <Text
            variant="bodySmall"
            style={[styles.taskDate, { color: theme.colors.secondary }]}
          >
            {task.date}
          </Text>
          <View style={styles.actionsContainer}>
            <Button
              testID="edit-button"
              mode="contained"
              onPress={() => onEdit(task.id)}
              style={styles.actionButton}
            >
              Edit
            </Button>
            <Button
              testID="delete-button"
              mode="contained"
              buttonColor={theme.colors.error}
              onPress={() => onDelete(task.id)}
              style={styles.actionButton}
            >
              Delete
            </Button>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  taskItem: {
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  taskText: {
    marginBottom: 4,
  },
  taskTextEdit: {
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  taskDate: {
    marginBottom: 12,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  actionButton: {
    borderRadius: 6,
    minWidth: 70,
  },
});

export default TaskListItem;

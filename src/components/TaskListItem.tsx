import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Task } from "../store/types";
import { Checkbox } from "./Checkbox";

interface TaskListItemProps {
  task: Task;
  onToggleComplete: (taskId: string, completed: boolean) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (taskId: string, title: string) => void;
}

export function TaskListItem({
  task,
  onToggleComplete,
  onDeleteTask,
  onEditTask,
}: TaskListItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);

  const handleSubmitEdit = () => {
    if (editedTitle.trim() !== "") {
      onEditTask(task.id, editedTitle.trim());
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedTitle(task.title);
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Checkbox
          value={task.completed}
          onValueChange={(value: boolean) => onToggleComplete(task.id, value)}
        />
        {isEditing ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.input}
              value={editedTitle}
              onChangeText={setEditedTitle}
              autoFocus
              onSubmitEditing={handleSubmitEdit}
              onBlur={handleCancelEdit}
            />
            <View style={styles.editButtons}>
              <TouchableOpacity
                onPress={handleSubmitEdit}
                style={[styles.button, styles.saveButton]}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCancelEdit}
                style={[styles.button, styles.cancelButton]}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.contentContainer}>
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              style={styles.titleContainer}
            >
              <Text
                style={[
                  styles.title,
                  task.completed && styles.completedTitle,
                ]}
              >
                {task.title}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onDeleteTask(task.id)}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginLeft: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    color: "#333",
  },
  completedTitle: {
    textDecorationLine: "line-through",
    color: "#888",
  },
  editContainer: {
    flex: 1,
    marginLeft: 12,
  },
  input: {
    fontSize: 16,
    padding: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  editButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  cancelButton: {
    backgroundColor: "#666",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
  },
  deleteButton: {
    padding: 8,
  },
  deleteText: {
    color: "#d32f2f",
    fontSize: 14,
  },
});

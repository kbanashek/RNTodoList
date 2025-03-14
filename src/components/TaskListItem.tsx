import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Card,
  Checkbox,
  IconButton,
  TextInput,
  Text,
} from "react-native-paper";
import { Task } from "../store/types";

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
          style={[
            styles.checkboxContainer,
            task.completed && styles.checkboxContainerCompleted,
          ]}
        >
          <Checkbox
            status={task.completed ? "checked" : "unchecked"}
            onPress={() => onToggleComplete(task.id, !task.completed)}
            color="#bb86fc"
            uncheckedColor="rgba(255, 255, 255, 0.7)"
          />
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
              right={
                <TextInput.Icon
                  icon="check"
                  onPress={handleSave}
                  disabled={
                    !editedTitle.trim() || editedTitle.trim() === task.title
                  }
                  color={
                    !editedTitle.trim() || editedTitle.trim() === task.title
                      ? "rgba(255, 255, 255, 0.3)"
                      : "#bb86fc"
                  }
                />
              }
            />
          ) : (
            <Text
              style={[styles.title, task.completed && styles.completedTitle]}
              numberOfLines={2}
            >
              {task.title}
            </Text>
          )}
        </View>
        <View style={styles.actions}>
          {isEditing ? (
            <IconButton
              icon="close"
              onPress={handleCancel}
              iconColor="#cf6679"
              size={20}
            />
          ) : (
            <>
              <IconButton
                icon="pencil"
                onPress={() => setIsEditing(true)}
                iconColor="#bb86fc"
                size={20}
              />
              <IconButton
                icon="delete"
                onPress={() => onDeleteTask(task.id)}
                iconColor="#cf6679"
                size={20}
              />
            </>
          )}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 4,
    backgroundColor: "#1e1e1e",
    elevation: 2,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  checkboxContainer: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 18,
    marginRight: 4,
  },
  checkboxContainerCompleted: {
    borderColor: "#bb86fc",
    backgroundColor: "rgba(187, 134, 252, 0.1)",
  },
  middleContent: {
    flex: 1,
    marginHorizontal: 8,
  },
  title: {
    fontSize: 16,
    color: "#ffffff",
  },
  completedTitle: {
    textDecorationLine: "line-through",
    opacity: 0.7,
  },
  input: {
    flex: 1,
    backgroundColor: "transparent",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
});

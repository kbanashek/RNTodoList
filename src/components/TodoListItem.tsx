import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Card,
  IconButton,
  TextInput,
  Text,
  ActivityIndicator,
} from "react-native-paper";
import { Todo } from "../store/types";
import { CustomCheckbox } from "./CustomCheckbox";

interface TodoListItemProps {
  todo: Todo;
  isLoading?: boolean;
  onToggleComplete: (todoId: string, completed: boolean) => void;
  onDeleteTodo: (todoId: string) => void;
  onEditTodo: (todoId: string, title: string) => void;
}

export function TodoListItem({
  todo,
  isLoading = false,
  onToggleComplete,
  onDeleteTodo,
  onEditTodo,
}: TodoListItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(todo.title);

  const handleSave = () => {
    const trimmedTitle = editedTitle.trim();
    if (trimmedTitle && trimmedTitle !== todo.title) {
      onEditTodo(todo.id, trimmedTitle);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(todo.title);
    setIsEditing(false);
  };

  return (
    <Card style={styles.container}>
      <View style={styles.content}>
        <View style={styles.checkboxContainer}>
          {isLoading ? (
            <ActivityIndicator size={32} color="#bb86fc" />
          ) : (
            <CustomCheckbox
              checked={todo.completed}
              onPress={() => onToggleComplete(todo.id, !todo.completed)}
              disabled={isLoading}
              color="#bb86fc"
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
                  disabled={
                    isLoading ||
                    !editedTitle.trim() ||
                    editedTitle.trim() === todo.title
                  }
                  color={
                    isLoading ||
                    !editedTitle.trim() ||
                    editedTitle.trim() === todo.title
                      ? "rgba(255, 255, 255, 0.3)"
                      : "#bb86fc"
                  }
                />
              }
            />
          ) : (
            <Text
              style={[
                styles.title,
                todo.completed && styles.completedTitle,
                isLoading && styles.loadingTitle,
              ]}
              numberOfLines={2}
            >
              {todo.title}
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
              disabled={isLoading}
            />
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
                onPress={() => onDeleteTodo(todo.id)}
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
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 24,
    marginVertical: 8,
    backgroundColor: "#333333",
    elevation: 2,
    borderRadius: 8,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  checkboxContainer: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  middleContent: {
    flex: 1,
    marginHorizontal: 12,
  },
  title: {
    fontSize: 16,
    color: "#ffffff",
  },
  completedTitle: {
    textDecorationLine: "line-through",
    opacity: 0.7,
  },
  loadingTitle: {
    opacity: 0.5,
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

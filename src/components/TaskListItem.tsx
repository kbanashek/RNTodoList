import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import {
  TextInput,
  IconButton,
  Checkbox,
  Text,
  useTheme,
} from "react-native-paper";
import { Task } from "../store/taskSlice";

interface TaskListItemProps {
  task: Task;
  isEditing: boolean;
  editText: string;
  isOffline: boolean;
  onToggleComplete: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task, newText: string) => void;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onChangeEditText: (text: string) => void;
  onSubmitEditText: () => void;
}

const TaskListItem: React.FC<TaskListItemProps> = ({
  task,
  isEditing,
  editText,
  isOffline,
  onToggleComplete,
  onDeleteTask,
  onStartEditing,
  onCancelEditing,
  onChangeEditText,
  onSubmitEditText,
}) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const isTemporary = task.id.startsWith("temp-");

  const renderTaskText = () => {
    if (isEditing) {
      return (
        <TextInput
          value={editText}
          onChangeText={onChangeEditText}
          onSubmitEditing={onSubmitEditText}
          onBlur={onCancelEditing}
          autoFocus
          mode="flat"
          style={[styles.input, { backgroundColor: "transparent" }]}
          textColor={theme.colors.onSurface}
          underlineColor="transparent"
          activeUnderlineColor={theme.colors.primary}
        />
      );
    }

    return (
      <Text
        style={[
          styles.text,
          task.completed && styles.completedText,
          isOffline && styles.offlineText,
        ]}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {task.text}
      </Text>
    );
  };

  return (
    <View
      style={[
        styles.container,
        task.completed && styles.completedContainer,
        isOffline && styles.offlineContainer,
        isTemporary && styles.temporaryContainer,
      ]}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      <View style={styles.checkboxContainer}>
        <Checkbox
          status={task.completed ? "checked" : "unchecked"}
          onPress={() => onToggleComplete(task)}
          color={theme.colors.primary}
        />
      </View>
      <View style={styles.contentContainer}>{renderTaskText()}</View>
      <View style={[styles.actionsContainer, isHovered && styles.actionsVisible]}>
        {!isEditing && (
          <>
            <IconButton
              icon="pencil"
              size={20}
              onPress={onStartEditing}
              iconColor={theme.colors.primary}
            />
            <IconButton
              icon="delete"
              size={20}
              onPress={() => onDeleteTask(task.id)}
              iconColor={theme.colors.error}
            />
          </>
        )}
        {isTemporary && (
          <IconButton
            icon="sync"
            size={20}
            iconColor={theme.colors.secondary}
            style={styles.syncIcon}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  completedContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  offlineContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.02)",
  },
  temporaryContainer: {
    backgroundColor: "rgba(255, 193, 7, 0.05)",
  },
  checkboxContainer: {
    marginRight: 8,
  },
  contentContainer: {
    flex: 1,
    marginRight: 8,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    opacity: 0.7,
  },
  actionsVisible: {
    opacity: 1,
  },
  input: {
    height: 40,
    paddingHorizontal: 0,
    fontSize: 16,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
  completedText: {
    textDecorationLine: "line-through",
    opacity: 0.7,
  },
  offlineText: {
    opacity: 0.8,
  },
  syncIcon: {
    marginLeft: -8,
  },
});

export default TaskListItem;

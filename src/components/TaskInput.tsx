import React, { useState } from "react";
import { View, StyleSheet, Platform, KeyboardAvoidingView } from "react-native";
import { TextInput, IconButton, useTheme } from "react-native-paper";
import { useTasks } from "../hooks/useTasks";
import { formatDate } from "../utils/dateFormatter";

const TaskInput: React.FC = () => {
  const theme = useTheme();
  const [text, setText] = useState("");
  const { addTask, isLoading } = useTasks();

  const handleSubmit = () => {
    const trimmedText = text.trim();
    if (trimmedText && !isLoading) {
      const tempId = `temp-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const newTask = {
        title: trimmedText,
        completed: false,
        createdAt: formatDate(new Date()),
      };

      addTask(newTask);
      setText("");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
    >
      <View
        style={[styles.container, { backgroundColor: theme.colors.surface }]}
      >
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Add a new todo..."
          mode="outlined"
          outlineColor={theme.colors.outline}
          activeOutlineColor={theme.colors.primary}
          style={[styles.input, { backgroundColor: theme.colors.background }]}
          onSubmitEditing={handleSubmit}
          returnKeyType="done"
          disabled={isLoading}
          autoCapitalize="sentences"
          blurOnSubmit={false}
          maxLength={100}
        />
        <IconButton
          icon="plus-circle"
          size={24}
          onPress={handleSubmit}
          disabled={!text.trim() || isLoading}
          iconColor={
            text.trim() && !isLoading
              ? theme.colors.primary
              : theme.colors.secondary
          }
          style={styles.button}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 8,
  },
  button: {
    margin: 4,
  },
});

export default TaskInput;

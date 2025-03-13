import React from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useDispatch } from "react-redux";
import TaskInput from "../components/TaskInput";
import TaskList from "../components/TaskList";
import { addTask } from "../store/taskSlice";

const Tasks = () => {
  const theme = useTheme();
  const dispatch = useDispatch();

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text variant="titleLarge" style={styles.title}>
        Task List
      </Text>
      <TaskInput />
      <TaskList />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 24,
    marginTop: 16,
    textAlign: "center",
  },
});

export default Tasks;

import React from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Button, useTheme } from "react-native-paper";
import { useDispatch } from "react-redux";
import { addTask } from "../store/taskSlice";

interface TaskInputProps {
  taskInput: string;
  onTaskInputChange: (text: string) => void;
  onAddTask: () => void;
}

const TaskInput = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [taskInput, setTaskInput] = React.useState<string>("");

  const handleAddTask = () => {
    if (taskInput.trim()) {
      dispatch(addTask({ text: taskInput.trim() }));
      setTaskInput("");
    }
  };

  return (
    <View
      style={[
        styles.inputContainer,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <TextInput
        mode="outlined"
        placeholder="New Task"
        value={taskInput}
        onChangeText={setTaskInput}
        style={styles.input}
        outlineColor={theme.colors.outline}
        activeOutlineColor={theme.colors.primary}
        placeholderTextColor={theme.colors.secondary}
        returnKeyType="done"
        onSubmitEditing={handleAddTask}
      />
      <Button
        mode="contained"
        onPress={handleAddTask}
        disabled={!taskInput.trim()}
        style={[styles.addButton, !taskInput.trim() && { opacity: 0.6 }]}
      >
        Add
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 8,
    alignItems: "center",
  },
  input: {
    flex: 1,
  },
  addButton: {
    minWidth: 80,
    borderRadius: 8,
  },
});

export default TaskInput;

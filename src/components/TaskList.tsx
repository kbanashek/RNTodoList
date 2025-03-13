import React from "react";
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";

import { Text, TextInput, useTheme, Button } from "react-native-paper";
import TaskListItem from "./TaskListItem";
import { useDispatch, useSelector } from "react-redux";
import {
  addTask,
  deleteTask,
  editTask,
  setEditingTaskID,
} from "../store/taskSlice";
import { RootState } from "../store";

interface Task {
  id: string;
  text: string;
  date: string;
}

const TaskList = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const tasks = useSelector((state: RootState) => state.tasks.tasks);
  const editingTaskID = useSelector(
    (state: RootState) => state.tasks.editingTaskID
  );
  const [taskInput, setTaskInput] = React.useState<string>("");

  const handleAddTask = () => {
    if (taskInput.trim() !== "") {
      dispatch(addTask({ text: taskInput.trim() }));
      setTaskInput("");
    }
  };

  const handleDeleteTask = (id: string) => {
    dispatch(deleteTask({ id }));
  };

  const handleEditTask = (id: string, newText: string) => {
    dispatch(editTask({ id, text: newText }));
    dispatch(setEditingTaskID(null));
  };

  const renderTask = ({ item }: { item: Task }) => (
    <TaskListItem
      task={item}
      isEditing={editingTaskID === item.id}
      onDelete={handleDeleteTask}
      onEdit={(id) => dispatch(setEditingTaskID(id))}
      onSave={(id, text) => handleEditTask(id, text)}
    />
  );

  return (
    <FlatList
      data={tasks}
      renderItem={renderTask}
      keyExtractor={(item) => item.id}
      style={styles.taskList}
      contentContainerStyle={styles.taskListContent}
    />
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
  taskList: {
    flex: 1,
  },
  taskListContent: {
    paddingBottom: 16,
  },
});

export default TaskList;

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Task } from "../types";
import { NetworkStatusBar } from "../components/NetworkStatusBar";
import { AddTaskDialog } from "../components/AddTaskDialog";
import { useTasks } from "../hooks/useTasks";

interface TaskData {
  title: string;
  completed: boolean;
  syncStatus: "pending" | "synced" | "error";
}

export const Tasks: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [isAddDialogVisible, setIsAddDialogVisible] = React.useState(false);
  const { tasks, isLoading, error, addTask, updateTask, deleteTask, syncTasks } =
    useTasks();

  const handleAddTask = async (title: string) => {
    await addTask({
      title,
      completed: false,
      syncStatus: "pending",
    } as TaskData);
    setIsAddDialogVisible(false);
  };

  const handleUpdateTask = async (task: Task) => {
    await updateTask(task.id, {
      completed: !task.completed,
      syncStatus: "pending",
    } as TaskData);
  };

  const handleDeleteTask = async (task: Task) => {
    await deleteTask(task.id);
  };

  const renderItem = ({ item }: { item: Task }) => (
    <View style={styles.taskItem}>
      <TouchableOpacity
        style={styles.taskContent}
        onPress={() => handleUpdateTask(item)}
      >
        <View style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
          {item.completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text
          style={[styles.taskTitle, item.completed && styles.taskTitleCompleted]}
        >
          {item.title}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteTask(item)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <NetworkStatusBar
        style={{ marginHorizontal: 16, marginBottom: 8 }}
        onRetry={syncTasks}
      />
      <View style={styles.header}>
        <Text style={styles.title}>Todo List</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAddDialogVisible(true)}
        >
          <Text style={styles.addButtonText}>Add Task</Text>
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <ActivityIndicator style={styles.loader} color="#4CAF50" />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={syncTasks}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : tasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tasks yet</Text>
          <Text style={styles.emptySubtext}>Add a task to get started</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
        />
      )}
      <AddTaskDialog
        visible={isAddDialogVisible}
        onClose={() => setIsAddDialogVisible(false)}
        onAdd={handleAddTask}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
  },
  addButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  list: {
    padding: 16,
  },
  taskItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#4CAF50",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#4CAF50",
  },
  checkmark: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  taskTitle: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  taskTitleCompleted: {
    textDecorationLine: "line-through",
    color: "#888",
  },
  deleteButton: {
    backgroundColor: "#ff6b6b",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 12,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#ff6b6b",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#888",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: "#888",
  },
});

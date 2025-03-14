import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from "react-native";
import { useTasks } from "../hooks/useTasks";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { NetworkStatusBar } from "../components/NetworkStatusBar";
import { TaskListItem } from "../components/TaskListItem";
import { TaskDialog } from "../components/TaskDialog";
import { Button } from "../components/Button";
import { Task } from "../types";

export const Tasks: React.FC = () => {
  const { tasks, isLoading, error, addTask, updateTask, deleteTask, clearStorage } = useTasks();
  const { isConnected } = useNetworkStatus();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleAddTask = useCallback(
    async (title: string) => {
      if (!title?.trim()) return;
      try {
        await addTask(title.trim());
        setDialogVisible(false);
      } catch (err) {
        console.error('Failed to add task:', err);
      }
    },
    [addTask]
  );

  const handleUpdateTask = useCallback(
    async (title: string) => {
      if (!editingTask?.id || !title?.trim()) return;
      try {
        await updateTask(editingTask.id, {
          title: title.trim(),
          updatedAt: new Date().toISOString(),
          syncStatus: "pending",
        });
        setEditingTask(null);
        setDialogVisible(false);
      } catch (err) {
        console.error('Failed to update task:', err);
      }
    },
    [editingTask, updateTask]
  );

  const handleToggleTask = useCallback(
    async (taskId: string) => {
      if (!taskId) return;
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      
      try {
        await updateTask(taskId, {
          completed: !task.completed,
          updatedAt: new Date().toISOString(),
          syncStatus: "pending",
        });
      } catch (err) {
        console.error('Failed to toggle task:', err);
      }
    },
    [tasks, updateTask]
  );

  const handleEditTask = useCallback((task: Task) => {
    if (!task?.id) return;
    setEditingTask(task);
    setDialogVisible(true);
  }, []);

  const handleDeleteTask = useCallback(async (taskId: string) => {
    if (!taskId) return;
    try {
      await deleteTask(taskId);
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  }, [deleteTask]);

  const handleClearStorage = useCallback(async () => {
    try {
      await clearStorage();
      window.location.reload();
    } catch (err) {
      console.error('Failed to clear storage:', err);
    }
  }, [clearStorage]);

  const handleCloseDialog = useCallback(() => {
    setDialogVisible(false);
    setEditingTask(null);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Task }) => {
      if (!item?.id || !item?.title) return null;
      return (
        <TaskListItem
          task={item}
          onToggle={handleToggleTask}
          onDelete={handleDeleteTask}
          onEdit={handleEditTask}
        />
      );
    },
    [handleToggleTask, handleDeleteTask, handleEditTask]
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error.message || 'An error occurred'}</Text>
          <View style={styles.buttonContainer}>
            <Button 
              title="Retry" 
              onPress={() => window.location.reload()} 
              style={styles.retryButton}
            />
            <Button 
              title="Clear Storage" 
              onPress={handleClearStorage}
              style={styles.clearButton}
            />
          </View>
        </View>
      );
    }

    if (!tasks?.length) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No tasks yet</Text>
          <Text style={styles.emptySubtext}>Add a task to get started</Text>
          <Button 
            title="Clear Storage" 
            onPress={handleClearStorage}
            style={[styles.clearButton, { marginTop: 16 }] as ViewStyle}
          />
        </View>
      );
    }

    return (
      <>
        <FlatList
          data={tasks}
          renderItem={renderItem}
          keyExtractor={(item) => item?.id || Math.random().toString()}
          contentContainerStyle={styles.list}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
          ListEmptyComponent={() => (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>No tasks yet</Text>
              <Text style={styles.emptySubtext}>Add a task to get started</Text>
            </View>
          )}
        />
        <Button 
          title="Clear Storage" 
          onPress={handleClearStorage}
          style={[styles.clearButton, { margin: 16 }] as ViewStyle}
        />
      </>
    );
  };

  return (
    <View style={styles.container}>
      <NetworkStatusBar />
      {renderContent()}
      <Button
        title="Add Task"
        onPress={() => setDialogVisible(true)}
        style={styles.addButton}
        disabled={!isConnected}
      />
      <TaskDialog
        visible={dialogVisible}
        onClose={handleCloseDialog}
        onSubmit={editingTask ? handleUpdateTask : handleAddTask}
        initialTitle={editingTask?.title}
        mode={editingTask ? "edit" : "add"}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  list: {
    padding: 16,
  },
  addButton: {
    margin: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#4CAF50",
  },
  clearButton: {
    backgroundColor: "#FF3B30",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 8,
  },
  margin: {
    margin: 16,
  },
  marginTop: {
    marginTop: 16,
  },
});

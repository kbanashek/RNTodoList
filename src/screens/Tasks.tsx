import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { TaskList } from '../components/TaskList';
import { TaskDialog } from '../components/TaskDialog';
import { Button } from '../components/Button';
import { NetworkStatusBar } from '../components/NetworkStatusBar';
import { Task } from '../store/types';
import { useTasks } from '../hooks/useTasks';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export const Tasks: React.FC = () => {
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { isConnected } = useNetworkStatus();
  const {
    tasks,
    isLoading,
    error,
    addTask,
    updateTask,
    deleteTask,
    syncTasks,
    reload,
  } = useTasks();

  const handleAddTask = useCallback(async (title: string) => {
    try {
      await addTask(title);
      setIsDialogVisible(false);
    } catch (error) {
      console.error('Error adding task:', error);
      // Dialog will show error from the service
      throw error;
    }
  }, [addTask]);

  const handleEditTask = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsDialogVisible(true);
  }, []);

  const handleUpdateTask = useCallback(async (title: string) => {
    if (!selectedTask) return;
    try {
      await updateTask(selectedTask.id, { ...selectedTask, title });
      setSelectedTask(null);
      setIsDialogVisible(false);
    } catch (error) {
      console.error('Error updating task:', error);
      // Dialog will show error from the service
      throw error;
    }
  }, [selectedTask, updateTask]);

  const handleToggleTask = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    try {
      await updateTask(taskId, { completed: !task.completed });
    } catch (error) {
      console.error('Error toggling task:', error);
      // TaskList will show error from the service
    }
  }, [tasks, updateTask]);

  const handleDeleteTask = useCallback(async (taskId: string) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
      // TaskList will show error from the service
    }
  }, [deleteTask]);

  const handleSyncTasks = useCallback(async () => {
    try {
      await syncTasks();
    } catch (error) {
      console.error('Error syncing tasks:', error);
      // TaskList will show error from the service
    }
  }, [syncTasks]);

  const handleCloseDialog = useCallback(() => {
    setSelectedTask(null);
    setIsDialogVisible(false);
  }, []);

  return (
    <View style={styles.container}>
      <NetworkStatusBar />
      <View style={styles.header}>
        <Button
          title="Add Task"
          onPress={() => setIsDialogVisible(true)}
          style={styles.addButton}
          disabled={!isConnected}
        />
        <Button
          title="Sync"
          onPress={handleSyncTasks}
          style={styles.syncButton}
          disabled={!isConnected}
        />
      </View>
      <TaskList
        tasks={tasks}
        isLoading={isLoading}
        error={error}
        onToggle={handleToggleTask}
        onDelete={handleDeleteTask}
        onEdit={handleEditTask}
        onRetry={reload}
      />
      <TaskDialog
        visible={isDialogVisible}
        task={selectedTask}
        onClose={handleCloseDialog}
        onSubmit={selectedTask ? handleUpdateTask : handleAddTask}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    flex: 1,
    marginRight: 8,
  },
  syncButton: {
    backgroundColor: '#2196F3',
    flex: 1,
    marginLeft: 8,
  },
});

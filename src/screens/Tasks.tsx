import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTasks } from '../hooks/useTasks';
import { TaskList } from '../components/TaskList';
import { AddTaskForm } from '../components/AddTaskForm';
import { NetworkStatusBar } from '../components/NetworkStatusBar';
import { Task } from '../store/types';

export const Tasks: React.FC = () => {
  const {
    tasks,
    isLoading,
    error,
    addTask,
    editTask,
    toggleTask,
    deleteTask,
    retrySync,
  } = useTasks();

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleAddTask = async (title: string) => {
    try {
      await addTask(title);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      await toggleTask(taskId);
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleEditTask = async (task: Task) => {
    setEditingTask(task);
  };

  const handleSaveEdit = async (taskId: string, title: string) => {
    try {
      await editTask(taskId, { title });
      setEditingTask(null);
    } catch (error) {
      console.error('Error editing task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleRetry = async () => {
    try {
      await retrySync();
    } catch (error) {
      console.error('Error retrying sync:', error);
    }
  };

  return (
    <View style={styles.container}>
      <NetworkStatusBar />
      <AddTaskForm
        onSubmit={handleAddTask}
        editingTask={editingTask}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={() => setEditingTask(null)}
      />
      <TaskList
        tasks={tasks}
        isLoading={isLoading}
        error={error}
        onToggle={handleToggleTask}
        onDelete={handleDeleteTask}
        onEdit={handleEditTask}
        onRetry={handleRetry}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTasks } from '../hooks/useTasks';
import { TaskList, AddTaskForm, NetworkStatusBar } from '../components';

export function Tasks() {
  const {
    tasks,
    isLoading,
    error,
    addTask,
    editTask,
    deleteTask,
  } = useTasks();

  const handleAddTask = async (title: string) => {
    try {
      await addTask(title);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    try {
      await editTask(taskId, { completed });
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleEditTask = async (taskId: string, title: string) => {
    try {
      await editTask(taskId, { title });
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

  return (
    <View style={styles.container}>
      <NetworkStatusBar />
      <AddTaskForm onSubmit={handleAddTask} />
      <TaskList
        tasks={tasks}
        isLoading={isLoading}
        error={error}
        onToggleComplete={handleToggleComplete}
        onDeleteTask={handleDeleteTask}
        onEditTask={handleEditTask}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

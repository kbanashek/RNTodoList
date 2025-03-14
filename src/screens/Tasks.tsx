import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { AddTaskForm } from '../components/AddTaskForm';
import { NetworkStatusBar } from '../components/NetworkStatusBar';
import { TaskList } from '../components/TaskList';
import { useTasks } from '../hooks/useTasks';

export function Tasks() {
  const { tasks, isLoading, error, addTask, editTask, deleteTask } = useTasks();

  const handleToggleComplete = (taskId: string, completed: boolean) => {
    editTask(taskId, { completed });
  };

  const handleEditTask = (taskId: string, title: string) => {
    editTask(taskId, { title });
  };

  return (
    <View style={styles.container}>
      <NetworkStatusBar />
      <Text variant="headlineLarge" style={styles.title}>My Todos</Text>
      <AddTaskForm onSubmit={addTask} />
      <TaskList
        tasks={tasks}
        isLoading={isLoading}
        error={error}
        onToggleComplete={handleToggleComplete}
        onDeleteTask={deleteTask}
        onEditTask={handleEditTask}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  title: {
    color: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 16,
  },
});

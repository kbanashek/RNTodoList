import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { AddTaskForm } from '../components/AddTaskForm';
import { NetworkStatusBar } from '../components/NetworkStatusBar';
import { TaskList } from '../components/TaskList';
import { useTasks } from '../hooks/useTasks';

export function Tasks() {
  const {
    tasks,
    isLoading,
    loadingTaskIds,
    error,
    addTask,
    editTask,
    deleteTask,
  } = useTasks();

  return (
    <View style={styles.container}>
      <NetworkStatusBar />
      <View style={styles.header}>
        <Text style={styles.title}>Todo List</Text>
        <AddTaskForm onSubmit={addTask} />
      </View>
      <TaskList
        tasks={tasks}
        isLoading={isLoading}
        loadingTaskIds={loadingTaskIds}
        error={error}
        onToggleComplete={(taskId, completed) =>
          editTask(taskId, { completed })
        }
        onDeleteTask={deleteTask}
        onEditTask={(taskId, title) => editTask(taskId, { title })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    padding: 16,
    paddingTop: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
});

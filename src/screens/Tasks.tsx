import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useTasks } from '@hooks/useTasks';
import { useNetworkStatus } from '@hooks/useServiceCheck';
import NetworkStatusBar from '@components/NetworkStatusBar';
import AddTaskDialog from '@components/AddTaskDialog';
import { Task } from '@types';

const Tasks: React.FC = () => {
  const { isConnected } = useNetworkStatus();
  const {
    tasks,
    pendingChanges,
    isLoading,
    error,
    addTask,
    updateTask,
    deleteTask,
    syncTasks,
  } = useTasks();
  const [isAddDialogVisible, setAddDialogVisible] = useState(false);

  const handleAddTask = async (title: string) => {
    try {
      await addTask({ 
        title, 
        completed: false, 
        syncStatus: 'pending' 
      });
      setAddDialogVisible(false);
    } catch (err) {
      console.error('Failed to add task:', err);
    }
  };

  const handleToggleTask = async (task: Task) => {
    try {
      await updateTask(task.id, { completed: !task.completed });
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleSync = async () => {
    try {
      await syncTasks();
    } catch (err) {
      console.error('Failed to sync tasks:', err);
    }
  };

  const renderItem = ({ item }: { item: Task }) => (
    <View style={styles.taskItem}>
      <TouchableOpacity
        style={[styles.checkbox, item.completed && styles.checkboxChecked]}
        onPress={() => handleToggleTask(item)}
      />
      <Text style={[styles.taskText, item.completed && styles.taskTextCompleted]}>
        {item.title}
      </Text>
      <TouchableOpacity onPress={() => handleDeleteTask(item.id)}>
        <Text style={styles.deleteButton}>×</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading tasks...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NetworkStatusBar
        isConnected={isConnected}
        pendingChanges={pendingChanges}
        onSync={handleSync}
      />
      <FlatList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setAddDialogVisible(true)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
      <AddTaskDialog
        visible={isAddDialogVisible}
        onAdd={handleAddTask}
        onClose={() => setAddDialogVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    flex: 1,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#666',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#666',
  },
  taskText: {
    flex: 1,
    fontSize: 16,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  deleteButton: {
    fontSize: 24,
    color: '#ff6b6b',
    paddingHorizontal: 10,
  },
  addButton: {
    position: 'absolute',
    right: 30,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButtonText: {
    fontSize: 32,
    color: '#fff',
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    margin: 20,
  },
});

export default Tasks;

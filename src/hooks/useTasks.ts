import { useState, useEffect } from 'react';
import { Task, PendingChange } from '@types';
import { todoService } from '@services/todoService';
import { useNetworkStatus } from './useNetworkStatus';

export const useTasks = () => {
  const { isConnected } = useNetworkStatus();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedTasks = await todoService.loadTasks();
      setTasks(loadedTasks || []);
      setPendingChanges(todoService.getPendingChanges());
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load tasks';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    if (isConnected && pendingChanges.length > 0) {
      syncTasks();
    }
  }, [isConnected, pendingChanges]);

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      const newTask = await todoService.addTask(taskData);
      setTasks(prevTasks => [...prevTasks, newTask]);
      setPendingChanges(todoService.getPendingChanges());
      return newTask;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add task';
      setError(errorMessage);
      throw err;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      setError(null);
      const updatedTask = await todoService.updateTask(taskId, updates);
      setTasks(prevTasks => prevTasks.map(task => task.id === taskId ? updatedTask : task));
      setPendingChanges(todoService.getPendingChanges());
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      setError(null);
      await todoService.deleteTask(taskId);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      setPendingChanges(todoService.getPendingChanges());
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
      setError(errorMessage);
      throw err;
    }
  };

  const syncTasks = async () => {
    if (!isConnected) {
      setError('Cannot sync while offline');
      return;
    }

    try {
      setError(null);
      await todoService.syncTasks();
      const updatedTasks = await todoService.loadTasks();
      setTasks(updatedTasks || []);
      setPendingChanges(todoService.getPendingChanges());
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync tasks';
      setError(errorMessage);
      throw err;
    }
  };

  return {
    tasks,
    pendingChanges,
    isLoading,
    error,
    addTask,
    updateTask,
    deleteTask,
    syncTasks,
    loadTasks,
  };
};

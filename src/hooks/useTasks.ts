import { useState, useEffect, useCallback } from 'react';
import { Task } from '../types';
import { todoService } from '../services/todoService';
import { useNetworkStatus } from './useNetworkStatus';

interface UseTasksState {
  tasks: Task[];
  isLoading: boolean;
  error: Error | null;
}

export const useTasks = () => {
  const [state, setState] = useState<UseTasksState>({
    tasks: [],
    isLoading: true,
    error: null,
  });

  const { isConnected, isInternetReachable } = useNetworkStatus();

  const loadTasks = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const tasks = await todoService.getTasks();
      setState(prev => ({ ...prev, tasks, isLoading: false }));
    } catch (error) {
      console.error('Error loading tasks:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to load tasks'),
        isLoading: false,
      }));
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const addTask = useCallback(async (title: string) => {
    try {
      const result = await todoService.addTask(title);
      setState(prev => ({ ...prev, tasks: result.tasks }));
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  }, []);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    try {
      const result = await todoService.updateTask(taskId, updates);
      setState(prev => ({ ...prev, tasks: result.tasks }));
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }, []);

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      const result = await todoService.deleteTask(taskId);
      setState(prev => ({ ...prev, tasks: result.tasks }));
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }, []);

  const syncTasks = useCallback(async () => {
    if (!isConnected || !isInternetReachable) {
      throw new Error('No internet connection available');
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const result = await todoService.syncTasks();
      setState(prev => ({
        ...prev,
        tasks: result.tasks,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error syncing tasks:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to sync tasks'),
        isLoading: false,
      }));
      throw error;
    }
  }, [isConnected, isInternetReachable]);

  const reload = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const result = await todoService.init();
      setState(prev => ({
        ...prev,
        tasks: result.tasks,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error reloading tasks:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to reload tasks'),
        isLoading: false,
      }));
    }
  }, []);

  return {
    ...state,
    addTask,
    updateTask,
    deleteTask,
    syncTasks,
    reload,
  };
};

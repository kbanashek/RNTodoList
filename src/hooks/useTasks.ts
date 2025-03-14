import { useState, useCallback, useEffect } from 'react';
import { Task } from '../store/types';
import { todoService } from '../services/todoService';
import { useNetworkStatus } from './useNetworkStatus';

interface TasksState {
  tasks: Task[];
  isLoading: boolean;
  error: Error | null;
}

export const useTasks = () => {
  const [state, setState] = useState<TasksState>({
    tasks: [],
    isLoading: true,
    error: null,
  });

  const { isConnected, isInternetReachable } = useNetworkStatus();

  const loadTasks = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const result = await todoService.init();
      setState({
        tasks: result.tasks,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error as Error,
      }));
    }
  }, []);

  const addTask = useCallback(async (title: string) => {
    try {
      const result = await todoService.addTask(title);
      setState(prev => ({
        ...prev,
        tasks: result.tasks,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as Error,
      }));
      throw error;
    }
  }, []);

  const editTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    try {
      const result = await todoService.editTask(taskId, updates);
      setState(prev => ({
        ...prev,
        tasks: result.tasks,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as Error,
      }));
      throw error;
    }
  }, []);

  const toggleTask = useCallback(async (taskId: string) => {
    try {
      const task = state.tasks.find(t => t.id === taskId);
      if (!task) return;

      const result = await todoService.editTask(taskId, {
        completed: !task.completed,
      });

      setState(prev => ({
        ...prev,
        tasks: result.tasks,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as Error,
      }));
      throw error;
    }
  }, [state.tasks]);

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      const result = await todoService.deleteTask(taskId);
      setState(prev => ({
        ...prev,
        tasks: result.tasks,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as Error,
      }));
      throw error;
    }
  }, []);

  const retrySync = useCallback(async () => {
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
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error as Error,
      }));
      throw error;
    }
  }, [isConnected, isInternetReachable]);

  // Initial load
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Background sync when online
  useEffect(() => {
    if (!isConnected || !isInternetReachable) return;

    const syncInterval = setInterval(() => {
      todoService.syncTasks().then(result => {
        setState(prev => ({
          ...prev,
          tasks: result.tasks,
          error: null,
        }));
      }).catch(error => {
        console.warn('Background sync failed:', error);
      });
    }, 30000);

    return () => clearInterval(syncInterval);
  }, [isConnected, isInternetReachable]);

  return {
    tasks: state.tasks,
    isLoading: state.isLoading,
    error: state.error,
    addTask,
    editTask,
    toggleTask,
    deleteTask,
    retrySync,
  };
};

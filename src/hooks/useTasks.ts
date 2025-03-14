import { useState, useCallback, useEffect } from 'react';
import { Task, PendingChange } from '../types/index';
import { todoService } from '../services/todoService';
import { useNetworkStatus } from './useNetworkStatus';
import { useAppDispatch } from '../store';
import { setSyncStatus } from '../store';

interface UseTasksState {
  tasks: Task[];
  pendingChanges: PendingChange[];
  isLoading: boolean;
  error: Error | null;
}

interface UseTasksReturn {
  tasks: Task[];
  pendingChanges: PendingChange[];
  isLoading: boolean;
  error: Error | null;
  addTask: (title: string) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  syncTasks: () => Promise<void>;
  clearStorage: () => Promise<void>;
}

export const useTasks = (): UseTasksReturn => {
  const [state, setState] = useState<UseTasksState>({
    tasks: [],
    pendingChanges: [],
    isLoading: true,
    error: null,
  });
  const dispatch = useAppDispatch();
  const { isConnected, isInternetReachable } = useNetworkStatus();

  const validateTask = useCallback((task: Task): boolean => {
    return !!(
      task &&
      typeof task === 'object' &&
      typeof task.id === 'string' &&
      typeof task.title === 'string' &&
      typeof task.completed === 'boolean' &&
      typeof task.createdAt === 'string' &&
      typeof task.updatedAt === 'string' &&
      ['synced', 'pending', 'error'].includes(task.syncStatus)
    );
  }, []);

  const sanitizeTasks = useCallback((tasks: Task[]): Task[] => {
    return tasks.filter(task => validateTask(task));
  }, [validateTask]);

  const fetchTasks = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const { tasks, pendingChanges } = await todoService.init();
      setState(prev => ({
        ...prev,
        tasks: sanitizeTasks(tasks),
        pendingChanges,
        isLoading: false,
      }));
      
      dispatch(setSyncStatus(pendingChanges.length > 0 ? 'pending' : 'synced'));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as Error,
        isLoading: false,
      }));
      dispatch(setSyncStatus('error'));
    }
  }, [dispatch, sanitizeTasks]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (isConnected && isInternetReachable && state.pendingChanges.length > 0) {
      syncTasks();
    }
  }, [isConnected, isInternetReachable]);

  const addTask = useCallback(async (title: string) => {
    if (!title?.trim()) {
      throw new Error('Task title is required');
    }

    try {
      dispatch(setSyncStatus('pending'));
      const { tasks, pendingChanges } = await todoService.addTask(title.trim());
      setState(prev => ({
        ...prev,
        tasks: sanitizeTasks(tasks),
        pendingChanges,
      }));
      if (pendingChanges.length === 0) {
        dispatch(setSyncStatus('synced'));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as Error,
      }));
      dispatch(setSyncStatus('error'));
      throw error;
    }
  }, [dispatch, sanitizeTasks]);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    if (!taskId || !updates) {
      throw new Error('Task ID and updates are required');
    }

    try {
      dispatch(setSyncStatus('pending'));
      const { tasks, pendingChanges } = await todoService.updateTask(taskId, updates);
      setState(prev => ({
        ...prev,
        tasks: sanitizeTasks(tasks),
        pendingChanges,
      }));
      if (pendingChanges.length === 0) {
        dispatch(setSyncStatus('synced'));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as Error,
      }));
      dispatch(setSyncStatus('error'));
      throw error;
    }
  }, [dispatch, sanitizeTasks]);

  const deleteTask = useCallback(async (taskId: string) => {
    if (!taskId) {
      throw new Error('Task ID is required');
    }

    try {
      dispatch(setSyncStatus('pending'));
      const { tasks, pendingChanges } = await todoService.deleteTask(taskId);
      setState(prev => ({
        ...prev,
        tasks: sanitizeTasks(tasks),
        pendingChanges,
      }));
      if (pendingChanges.length === 0) {
        dispatch(setSyncStatus('synced'));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as Error,
      }));
      dispatch(setSyncStatus('error'));
      throw error;
    }
  }, [dispatch, sanitizeTasks]);

  const syncTasks = useCallback(async () => {
    if (!isConnected || !isInternetReachable) return;
    try {
      dispatch(setSyncStatus('pending'));
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const { tasks, pendingChanges } = await todoService.syncTasks();
      setState(prev => ({
        ...prev,
        tasks: sanitizeTasks(tasks),
        pendingChanges,
        isLoading: false,
      }));
      dispatch(setSyncStatus(pendingChanges.length > 0 ? 'pending' : 'synced'));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as Error,
        isLoading: false,
      }));
      dispatch(setSyncStatus('error'));
    }
  }, [isConnected, isInternetReachable, dispatch, sanitizeTasks]);

  const clearStorage = useCallback(async () => {
    try {
      await todoService.clearStorage();
      setState({
        tasks: [],
        pendingChanges: [],
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as Error,
      }));
      throw error;
    }
  }, []);

  return {
    ...state,
    addTask,
    updateTask,
    deleteTask,
    syncTasks,
    clearStorage,
  };
};

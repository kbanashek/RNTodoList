import { useCallback, useEffect } from 'react';
import { Task } from '../store/types';
import { TodoService } from '../services/todoService';
import { useNetworkStatus } from './useNetworkStatus';
import { useAppDispatch, useAppSelector } from '../store';
import { setTasks, setLoading, setError, addLoadingTaskId, removeLoadingTaskId } from '../store/todoSlice';

//TODO: move into .env
const todoService = new TodoService({
  baseUrl: 'https://dummyjson.com',
  userId: 1,
});

export const useTodos = () => {
  const dispatch = useAppDispatch();
  const { tasks, isLoading, error, loadingTaskIds } = useAppSelector((state) => state.todos);
  const networkStatus = useNetworkStatus();
  const isOnline = !networkStatus.isOffline && networkStatus.isInternetReachable;

  const loadTodos = useCallback(async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      // First load from local storage
      const localResult = await todoService.init();
      dispatch(setTasks(localResult.tasks));

      // Then fetch from API if online
      if (isOnline) {
        const apiResult = await todoService.fetchTasks();
        dispatch(setTasks(apiResult.tasks));
        dispatch(setLoading(false));
        dispatch(setError(null));
      } else {
        dispatch(setLoading(false));
        dispatch(setError(null));
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      dispatch(setLoading(false));
      dispatch(setError(error instanceof Error ? error.message : 'Failed to load tasks'));
    }
  }, [dispatch, isOnline]);

  const addTodo = useCallback(async (title: string) => {
    try {
      const result = await todoService.addTask(title);
      dispatch(setTasks([...result.tasks]));
    } catch (error) {
      dispatch(setError(error instanceof Error ? error.message : 'Failed to add task'));
    }
  }, [dispatch]);

  const editTodo = useCallback(async (taskId: string, updates: Partial<Task>) => {
    try {
      dispatch(addLoadingTaskId(taskId));
      const result = await todoService.editTask(taskId, updates);
      dispatch(setTasks([...result.tasks]));
      dispatch(removeLoadingTaskId(taskId));
    } catch (error) {
      dispatch(removeLoadingTaskId(taskId));
      dispatch(setError(error instanceof Error ? error.message : 'Failed to edit task'));
    }
  }, [dispatch]);

  const deleteTodo = useCallback(async (taskId: string) => {
    try {
      dispatch(addLoadingTaskId(taskId));
      const result = await todoService.deleteTask(taskId);
      dispatch(setTasks([...result.tasks]));
      dispatch(removeLoadingTaskId(taskId));
    } catch (error) {
      dispatch(removeLoadingTaskId(taskId));
      dispatch(setError(error instanceof Error ? error.message : 'Failed to delete task'));
    }
  }, [dispatch]);

  const fetchTasks = useCallback(async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const { tasks: fetchedTasks } = await todoService.fetchTasks();
      dispatch(setTasks([...fetchedTasks]));
    } catch (err) {
      dispatch(setError(err instanceof Error ? err.message : 'Failed to fetch tasks'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  return {
    tasks,
    isLoading,
    loadingTaskIds,
    error,
    addTodo,
    editTodo,
    deleteTodo,
    loadTodos,
    fetchTasks,
  };
};

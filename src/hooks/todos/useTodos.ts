import { useCallback, useEffect, useState } from 'react';
import { Todo } from '../../store/types';
import { TodoService } from '../../services/todoService';
import { useNetworkStatus } from '../network/useNetworkStatus';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  setTasks,
  setLoading,
  setError,
  addLoadingTaskId,
  removeLoadingTaskId,
} from '../../store/slices/todoSlice';
import { Snackbar } from 'react-native-paper';
import { TodoStorage } from '../../storage';

//TODO: move into .env
const todoService = new TodoService({
  baseUrl: 'https://dummyjson.com',
  userId: 1,
});

export const useTodos = () => {
  const dispatch = useAppDispatch();
  const { tasks, isLoading, error, loadingTaskIds } = useAppSelector(state => state.todos);
  const networkStatus = useNetworkStatus();
  const isOnline = !networkStatus.isOffline && networkStatus.isInternetReachable;
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarAction, setSnackbarAction] = useState<
    { label: string; onPress: () => void } | undefined
  >(undefined);

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

  const addTodo = useCallback(
    async (title: string) => {
      try {
        const result = await todoService.addTask(title);
        dispatch(setTasks([...result.tasks]));
      } catch (error) {
        dispatch(setError(error instanceof Error ? error.message : 'Failed to add task'));
      }
    },
    [dispatch]
  );

  const editTodo = useCallback(
    async (taskId: string, updates: Partial<Todo>) => {
      try {
        dispatch(addLoadingTaskId(taskId));
        const result = await todoService.editTask(taskId, updates);
        dispatch(setTasks([...result.tasks]));
        dispatch(removeLoadingTaskId(taskId));
      } catch (error) {
        dispatch(removeLoadingTaskId(taskId));
        dispatch(setError(error instanceof Error ? error.message : 'Failed to edit task'));
      }
    },
    [dispatch]
  );

  const deleteTodo = useCallback(
    async (taskId: string) => {
      try {
        dispatch(addLoadingTaskId(taskId));
        const result = await todoService.deleteTask(taskId);
        dispatch(setTasks([...result.tasks]));
        dispatch(removeLoadingTaskId(taskId));
      } catch (error) {
        dispatch(removeLoadingTaskId(taskId));
        dispatch(setError(error instanceof Error ? error.message : 'Failed to delete task'));
      }
    },
    [dispatch]
  );

  const updateDueDate = useCallback(
    async (taskId: string, dueDate: string | null) => {
      try {
        dispatch(addLoadingTaskId(taskId));
        const result = await todoService.editTask(taskId, { dueDate });
        dispatch(setTasks([...result.tasks]));
        dispatch(removeLoadingTaskId(taskId));

        // Show feedback to user
        if (dueDate) {
          const formattedDate = new Date(dueDate).toLocaleDateString();
          setSnackbarMessage(`Due date set to ${formattedDate}`);
        } else {
          setSnackbarMessage('Due date cleared');
        }
        setSnackbarAction({
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        });
        setSnackbarVisible(true);
      } catch (error) {
        dispatch(removeLoadingTaskId(taskId));
        dispatch(setError(error instanceof Error ? error.message : 'Failed to update due date'));
      }
    },
    [dispatch]
  );

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

  const exportTodosAsJson = useCallback(async () => {
    try {
      // First export the todos to a file in the app's document directory
      const filePath = await TodoStorage.exportTodosAsJson();
      if (!filePath) {
        throw new Error('Failed to export todos');
      }

      // Show a success message using Snackbar
      setSnackbarMessage(
        "Todos exported. Run 'npm run export-todos' to save them to the realm-data directory."
      );
      setSnackbarAction({
        label: 'OK',
        onPress: () => setSnackbarVisible(false),
      });
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Error exporting todos:', error);
      // Show error message using Snackbar
      setSnackbarMessage(error instanceof Error ? error.message : 'Export failed');
      setSnackbarAction({
        label: 'Dismiss',
        onPress: () => setSnackbarVisible(false),
      });
      setSnackbarVisible(true);
    }
  }, []);

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
    exportTodosAsJson,
    updateDueDate,
    snackbarProps: {
      visible: snackbarVisible,
      onDismiss: () => setSnackbarVisible(false),
      action: snackbarAction,
      duration: 4000,
      children: snackbarMessage,
    },
  };
};

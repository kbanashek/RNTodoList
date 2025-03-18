import { renderHook, waitFor, act } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useTodos } from '../todos/useTodos';
import { TodoService } from '../../services/todoService';
import todoReducer from '../../store/slices/todoSlice';
import { useNetworkStatus } from '../network/useNetworkStatus';
import { NetworkType, Todo } from '../../store/types';
import React from 'react';

jest.mock('../../services/todoService');
jest.mock('../network/useNetworkStatus');

const mockTasks: Todo[] = [
  {
    id: 'task1',
    title: 'Test Task',
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const newTask: Todo = {
  id: 'new_task',
  title: 'New Task',
  completed: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const updatedTask: Todo = {
  ...mockTasks[0],
  title: 'Updated Task',
  completed: true,
  updatedAt: new Date().toISOString(),
};

beforeEach(() => {
  jest.clearAllMocks();
  (useNetworkStatus as jest.Mock).mockReturnValue({
    isOffline: false,
    isInternetReachable: true,
    isConnected: true,
    type: NetworkType.WIFI,
    lastChecked: new Date().toISOString(),
  });
  (TodoService.prototype.init as jest.Mock).mockResolvedValue({ tasks: mockTasks });
  (TodoService.prototype.fetchTasks as jest.Mock).mockResolvedValue({ tasks: mockTasks });
  (TodoService.prototype.addTask as jest.Mock).mockResolvedValue({
    tasks: [newTask, ...mockTasks],
  });
  (TodoService.prototype.editTask as jest.Mock).mockResolvedValue({
    tasks: mockTasks.map(task => (task.id === 'task1' ? updatedTask : task)),
  });
  (TodoService.prototype.deleteTask as jest.Mock).mockResolvedValue({
    tasks: mockTasks.filter(task => task.id !== 'task1'),
  });
});

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const store = configureStore({
    reducer: { todos: todoReducer },
    preloadedState: {
      todos: {
        tasks: [],
        isLoading: false,
        error: null,
        loadingTaskIds: [],
      },
    },
  });
  return <Provider store={store}>{children}</Provider>;
};

describe('useTodos', () => {
  const originalConsoleError = console.error;

  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  it('loads tasks from local storage and API when online', async () => {
    const { result } = renderHook(() => useTodos(), { wrapper });
    await waitFor(() => {
      expect(TodoService.prototype.init).toHaveBeenCalled();
      expect(TodoService.prototype.fetchTasks).toHaveBeenCalled();
      expect(result.current.tasks).toEqual(mockTasks);
    });
  });

  it('handles errors during task loading', async () => {
    (TodoService.prototype.fetchTasks as jest.Mock).mockRejectedValue(
      new Error('Failed to load tasks')
    );
    const { result } = renderHook(() => useTodos(), { wrapper });
    await waitFor(() => {
      expect(TodoService.prototype.init).toHaveBeenCalled();
      expect(TodoService.prototype.fetchTasks).toHaveBeenCalled();
      expect(result.current.error).toBe('Failed to load tasks');
    });
  });

  it('adds a new todo', async () => {
    const { result } = renderHook(() => useTodos(), { wrapper });

    await waitFor(() => {
      expect(result.current.tasks).toEqual(mockTasks);
    });

    await act(async () => {
      await result.current.addTodo('New Task');
    });

    await waitFor(() => {
      expect(TodoService.prototype.addTask).toHaveBeenCalledWith('New Task');
      expect(result.current.tasks).toEqual([newTask, ...mockTasks]);
    });
  });

  it('handles errors when adding a todo', async () => {
    (TodoService.prototype.addTask as jest.Mock).mockRejectedValue(new Error('Failed to add task'));

    const { result } = renderHook(() => useTodos(), { wrapper });

    await waitFor(() => {
      expect(result.current.tasks).toEqual(mockTasks);
    });

    await act(async () => {
      await result.current.addTodo('New Task');
    });

    await waitFor(() => {
      expect(TodoService.prototype.addTask).toHaveBeenCalledWith('New Task');
      expect(result.current.error).toBe('Failed to add task');
    });
  });

  it('edits a todo', async () => {
    const { result } = renderHook(() => useTodos(), { wrapper });

    await waitFor(() => {
      expect(result.current.tasks).toEqual(mockTasks);
    });

    await act(async () => {
      await result.current.editTodo('task1', { title: 'Updated Task', completed: true });
    });

    await waitFor(() => {
      expect(TodoService.prototype.editTask).toHaveBeenCalledWith('task1', {
        title: 'Updated Task',
        completed: true,
      });
      expect(result.current.tasks[0].title).toBe('Updated Task');
      expect(result.current.tasks[0].completed).toBe(true);
      expect(result.current.loadingTaskIds).not.toContain('task1');
    });
  });

  it('handles errors when editing a todo', async () => {
    (TodoService.prototype.editTask as jest.Mock).mockRejectedValue(
      new Error('Failed to edit task')
    );

    const { result } = renderHook(() => useTodos(), { wrapper });

    await waitFor(() => {
      expect(result.current.tasks).toEqual(mockTasks);
    });

    await act(async () => {
      await result.current.editTodo('task1', { title: 'Updated Task' });
    });

    await waitFor(() => {
      expect(TodoService.prototype.editTask).toHaveBeenCalledWith('task1', {
        title: 'Updated Task',
      });
      expect(result.current.error).toBe('Failed to edit task');
      expect(result.current.loadingTaskIds).not.toContain('task1');
    });
  });

  it('deletes a todo', async () => {
    const { result } = renderHook(() => useTodos(), { wrapper });

    await waitFor(() => {
      expect(result.current.tasks).toEqual(mockTasks);
    });

    await act(async () => {
      await result.current.deleteTodo('task1');
    });

    await waitFor(() => {
      expect(TodoService.prototype.deleteTask).toHaveBeenCalledWith('task1');
      expect(result.current.tasks).toEqual([]);
      expect(result.current.loadingTaskIds).not.toContain('task1');
    });
  });

  it('handles errors when deleting a todo', async () => {
    (TodoService.prototype.deleteTask as jest.Mock).mockRejectedValue(
      new Error('Failed to delete task')
    );

    const { result } = renderHook(() => useTodos(), { wrapper });

    await waitFor(() => {
      expect(result.current.tasks).toEqual(mockTasks);
    });

    await act(async () => {
      await result.current.deleteTodo('task1');
    });

    await waitFor(() => {
      expect(TodoService.prototype.deleteTask).toHaveBeenCalledWith('task1');
      expect(result.current.error).toBe('Failed to delete task');
      expect(result.current.loadingTaskIds).not.toContain('task1');
    });
  });

  it('fetches tasks from API', async () => {
    const { result } = renderHook(() => useTodos(), { wrapper });

    await waitFor(() => {
      expect(result.current.tasks).toEqual(mockTasks);
    });

    (TodoService.prototype.fetchTasks as jest.Mock).mockClear();

    await act(async () => {
      await result.current.fetchTasks();
    });

    await waitFor(() => {
      expect(TodoService.prototype.fetchTasks).toHaveBeenCalled();
      expect(result.current.tasks).toEqual(mockTasks);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('handles errors when fetching tasks', async () => {
    const { result } = renderHook(() => useTodos(), { wrapper });

    await waitFor(() => {
      expect(result.current.tasks).toEqual(mockTasks);
    });

    (TodoService.prototype.fetchTasks as jest.Mock).mockRejectedValue(
      new Error('Failed to fetch tasks')
    );

    await act(async () => {
      await result.current.fetchTasks();
    });

    await waitFor(() => {
      expect(TodoService.prototype.fetchTasks).toHaveBeenCalled();
      expect(result.current.error).toBe('Failed to fetch tasks');
      expect(result.current.isLoading).toBe(false);
    });
  });
});

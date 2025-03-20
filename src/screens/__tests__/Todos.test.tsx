import React from 'react';
import { render } from '@testing-library/react-native';
import { Todos } from '../Todos';
import { mockTodos } from '../../../__mocks__/mockData';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { Todo } from '../../store/types';

// Create a mock store
const mockStore = configureStore<{
  todos: {
    tasks: Todo[];
    isLoading: boolean;
    loadingTaskIds: string[];
    error: string | null;
  };
  network: {
    isOffline: boolean;
    isInternetReachable: boolean;
    connectionType: string;
    lastChecked: string;
  };
}>([]);

const initialState = {
  todos: {
    tasks: mockTodos,
    isLoading: false,
    loadingTaskIds: [],
    error: null,
  },
  network: {
    isOffline: false,
    isInternetReachable: true,
    connectionType: 'wifi',
    lastChecked: new Date().toISOString(),
  },
};

// Mock the hooks and components used by Todos
jest.mock('../../hooks/todos/useTodos', () => ({
  useTodos: () => ({
    tasks: mockTodos,
    isLoading: false,
    loadingTaskIds: [],
    error: null,
    addTodo: jest.fn(),
    editTodo: jest.fn(),
    deleteTodo: jest.fn(),
  }),
}));

// Mock the network status hook
jest.mock('../../hooks/network/useNetworkStatus', () => ({
  useNetworkStatus: () => ({
    isOffline: false,
    isInternetReachable: true,
    connectionType: 'wifi',
  }),
}));

jest.mock('../../components/AddTodoForm', () => ({
  AddTodoForm: ({ onSubmit }: { onSubmit: (title: string) => void }) => null,
}));

jest.mock('../../components/TodoList', () => ({
  TodoList: ({
    tasks,
    isLoading,
    loadingTaskIds,
    error,
    onToggleComplete,
    onDeleteTask,
    onEditTask,
  }: {
    tasks: Todo[];
    isLoading: boolean;
    loadingTaskIds: string[];
    error: string | null;
    onToggleComplete: (taskId: string, completed: boolean) => void;
    onDeleteTask: (taskId: string) => void;
    onEditTask: (taskId: string, title: string) => void;
  }) => null,
}));

jest.mock('react-native-paper', () => ({
  Text: () => null,
}));

describe('Todos Screen', () => {
  let store: ReturnType<typeof mockStore>;

  beforeEach(() => {
    store = mockStore(initialState);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(Todos).toBeDefined();
  });

  it('renders without crashing', () => {
    const result = render(
      <Provider store={store}>
        <Todos />
      </Provider>
    );
    expect(result).toBeTruthy();
  });

  // Test loading state
  it('renders in loading state', () => {
    // Override the mock for this specific test
    jest.spyOn(require('../../hooks/todos/useTodos'), 'useTodos').mockReturnValue({
      tasks: [],
      isLoading: true,
      loadingTaskIds: [],
      error: null,
      addTodo: jest.fn(),
      editTodo: jest.fn(),
      deleteTodo: jest.fn(),
    });

    const result = render(
      <Provider store={store}>
        <Todos />
      </Provider>
    );
    expect(result).toBeTruthy();
  });

  // Test error state
  it('renders in error state', () => {
    // Override the mock for this specific test
    jest.spyOn(require('../../hooks/todos/useTodos'), 'useTodos').mockReturnValue({
      tasks: [],
      isLoading: false,
      loadingTaskIds: [],
      error: 'Network error',
      addTodo: jest.fn(),
      editTodo: jest.fn(),
      deleteTodo: jest.fn(),
    });

    const result = render(
      <Provider store={store}>
        <Todos />
      </Provider>
    );
    expect(result).toBeTruthy();
  });

  // Test offline state
  it('renders in offline state', () => {
    // Override network status mock
    jest
      .spyOn(require('../../hooks/network/useNetworkStatus'), 'useNetworkStatus')
      .mockReturnValue({
        isOffline: true,
        isInternetReachable: false,
        connectionType: 'none',
      });

    const result = render(
      <Provider store={store}>
        <Todos />
      </Provider>
    );
    expect(result).toBeTruthy();
  });

  // Test with tasks loading
  it('renders with specific tasks loading', () => {
    // Override the mock for this specific test
    jest.spyOn(require('../../hooks/todos/useTodos'), 'useTodos').mockReturnValue({
      tasks: mockTodos,
      isLoading: false,
      loadingTaskIds: [mockTodos[0].id],
      error: null,
      addTodo: jest.fn(),
      editTodo: jest.fn(),
      deleteTodo: jest.fn(),
    });

    const result = render(
      <Provider store={store}>
        <Todos />
      </Provider>
    );
    expect(result).toBeTruthy();
  });
});

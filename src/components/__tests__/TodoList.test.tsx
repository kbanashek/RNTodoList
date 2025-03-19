import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TodoList } from '../TodoList';
import { Todo } from '../../store/types';

// Mock the TodoListItem component
jest.mock('../TodoListItem', () => ({
  TodoListItem: () => null,
}));

// Mock react-native-paper components
jest.mock('react-native-paper', () => ({
  ActivityIndicator: () => null,
  Text: () => null,
}));

describe('TodoList', () => {
  const mockTasks: Todo[] = [
    {
      id: '1',
      title: 'Test Todo 1',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Test Todo 2',
      completed: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const mockHandlers = {
    onToggleComplete: jest.fn(),
    onDeleteTask: jest.fn(),
    onEditTask: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(TodoList).toBeDefined();
  });

  it('renders without crashing', () => {
    const result = render(
      <TodoList
        tasks={[]}
        isLoading={false}
        loadingTaskIds={[]}
        error={null}
        onToggleComplete={mockHandlers.onToggleComplete}
        onDeleteTask={mockHandlers.onDeleteTask}
        onEditTask={mockHandlers.onEditTask}
      />
    );
    expect(result).toBeTruthy();
  });

  // For now, we'll just test that the component renders with tasks
  it('renders with tasks', () => {
    const { getByTestId } = render(
      <TodoList
        tasks={mockTasks}
        isLoading={false}
        loadingTaskIds={[]}
        error={null}
        onToggleComplete={mockHandlers.onToggleComplete}
        onDeleteTask={mockHandlers.onDeleteTask}
        onEditTask={mockHandlers.onEditTask}
      />
    );

    // Check if the todo-list element exists
    expect(getByTestId('todo-list')).toBeTruthy();
  });
});

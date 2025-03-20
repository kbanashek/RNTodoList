import React from 'react';
import { render } from '@testing-library/react-native';
import { TodoListItem } from '../TodoListItem';
import { Todo } from '../../../src/store/types';
import { mockTodo } from '../../../__mocks__/mockData';

jest.mock('react-native-paper', () => ({
  Card: () => null,
  TextInput: () => null,
  IconButton: () => null,
  ActivityIndicator: () => null,
  Text: () => null,
}));

jest.mock('react-native', () => {
  const reactNative = jest.requireActual('react-native');
  reactNative.Pressable = () => null;
  return reactNative;
});

describe('TodoListItem', () => {
  const mockHandlers = {
    onToggleComplete: jest.fn(),
    onDeleteTask: jest.fn(),
    onEditTask: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(TodoListItem).toBeDefined();
  });

  it('renders without crashing', () => {
    const result = render(
      <TodoListItem
        task={mockTodo}
        onToggleComplete={mockHandlers.onToggleComplete}
        onDeleteTask={mockHandlers.onDeleteTask}
        onEditTask={mockHandlers.onEditTask}
      />
    );
    expect(result).toBeTruthy();
  });

  it('renders with loading state', () => {
    const result = render(
      <TodoListItem
        task={mockTodo}
        isLoading={true}
        onToggleComplete={mockHandlers.onToggleComplete}
        onDeleteTask={mockHandlers.onDeleteTask}
        onEditTask={mockHandlers.onEditTask}
      />
    );
    expect(result).toBeTruthy();
  });
});

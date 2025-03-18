import React from 'react';
import { render } from '@testing-library/react-native';
import { AddTodoForm } from '../AddTodoForm';

// Mock the TextInput and IconButton components
jest.mock('react-native-paper', () => {
  const TextInput = () => null;
  TextInput.Icon = () => null;

  return {
    TextInput,
    IconButton: () => null,
  };
});

describe('AddTodoForm', () => {
  // Create a mock for the onSubmit prop
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(AddTodoForm).toBeDefined();
  });

  it('should render', () => {
    render(<AddTodoForm onSubmit={mockOnSubmit} />);
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});

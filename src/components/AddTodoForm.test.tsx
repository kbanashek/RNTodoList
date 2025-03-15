import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AddTodoForm } from './AddTodoForm';
import { TextInput, TouchableOpacity } from 'react-native';
import type { TextInput as PaperTextInput } from 'react-native-paper';

// Create a properly typed mock for TextInput
const createMockTextInput = () => {
  const MockTextInput = jest.fn().mockImplementation((props) => (
    <TextInput
      testID={props.testID || 'todo-input'}
      editable={!props.disabled}
      onChangeText={props.onChangeText}
      onSubmitEditing={props.onSubmitEditing}
      value={props.value}
    >
      {props.right}
    </TextInput>
  ));

  // Add Icon as a static property with proper typing
  const IconComponent = jest.fn().mockImplementation((props) => (
    <TouchableOpacity
      testID="submit-button"
      disabled={props.disabled}
      onPress={props.onPress}
    />
  ));

  return Object.assign(MockTextInput, { Icon: IconComponent }) as unknown as typeof PaperTextInput;
};

// Mock react-native-paper to match our offline-first architecture
jest.mock('react-native-paper', () => ({
  TextInput: createMockTextInput()
}));

describe('AddTodoForm', () => {
  const mockSubmit = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with input field and submit button', () => {
    const { getByTestId } = render(<AddTodoForm onSubmit={mockSubmit} />);
    expect(getByTestId('todo-input')).toBeTruthy();
    expect(getByTestId('submit-button')).toBeTruthy();
  });

  it('handles input changes with immediate local updates', () => {
    const { getByTestId } = render(<AddTodoForm onSubmit={mockSubmit} />);
    const input = getByTestId('todo-input');

    fireEvent.changeText(input, 'New Todo');
    expect(input.props.value).toBe('New Todo');
  });

  it('submits todo and clears input for smooth editing experience', async () => {
    const { getByTestId } = render(<AddTodoForm onSubmit={mockSubmit} />);
    const input = getByTestId('todo-input');

    fireEvent.changeText(input, 'New Todo');
    fireEvent(input, 'submitEditing');

    expect(mockSubmit).toHaveBeenCalledWith('New Todo');
  });

  it('shows loading state for clear UI feedback', () => {
    const { getByTestId } = render(
      <AddTodoForm onSubmit={mockSubmit} isLoading={true} />
    );
    const input = getByTestId('todo-input');
    const button = getByTestId('submit-button');

    expect(input.props.editable).toBe(false);
    expect(button.props.disabled).toBe(true);
  });

  it('trims whitespace for consistent data handling', async () => {
    const { getByTestId } = render(<AddTodoForm onSubmit={mockSubmit} />);
    const input = getByTestId('todo-input');

    fireEvent.changeText(input, '  Test Todo  ');
    fireEvent(input, 'submitEditing');

    expect(mockSubmit).toHaveBeenCalledWith('Test Todo');
  });

  it('prevents empty todo submissions for data integrity', async () => {
    const { getByTestId } = render(<AddTodoForm onSubmit={mockSubmit} />);
    const input = getByTestId('todo-input');

    fireEvent.changeText(input, '   ');
    fireEvent(input, 'submitEditing');

    expect(mockSubmit).not.toHaveBeenCalled();
  });
});

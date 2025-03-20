import { Todo } from '../src/store/types';

export const mockTodos: Todo[] = [
  {
    id: 'task_123',
    title: 'Test Task 1',
    completed: false,
    createdAt: '2025-03-18T10:00:00.000Z',
    updatedAt: '2025-03-18T10:00:00.000Z',
  },
  {
    id: 'task_456',
    title: 'Test Task 2',
    completed: true,
    createdAt: '2025-03-18T11:00:00.000Z',
    updatedAt: '2025-03-18T11:00:00.000Z',
  },
];

export const mockTodo: Todo = {
  id: '1',
  title: 'Test Todo',
  completed: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockApiResponse = {
  todos: [
    {
      id: 1,
      todo: 'API Task 1',
      completed: false,
      userId: 1,
    },
    {
      id: 2,
      todo: 'API Task 2',
      completed: true,
      userId: 1,
    },
  ],
  total: 2,
  skip: 0,
  limit: 10,
};

export const mockTodoServiceConfig = {
  baseUrl: 'https://dummyjson.com',
  userId: 1,
};

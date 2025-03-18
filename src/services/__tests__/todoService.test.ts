import { TodoService } from '../todoService';
import { TodoStorage } from '../../storage';
import { Todo } from '../../store/types';

// Mock the TodoStorage module
jest.mock('../../storage/todoStorage');

describe('TodoService', () => {
  // Mock console.error
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  
  afterAll(() => {
    console.error = originalConsoleError;
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockConfig = {
    baseUrl: 'https://dummyjson.com',
    userId: 1
  };

  const mockTasks: Todo[] = [
    {
      id: 'task_123',
      title: 'Local Task',
      completed: false,
      createdAt: '2025-03-18T10:00:00.000Z',
      updatedAt: '2025-03-18T10:00:00.000Z'
    }
  ];

  describe('init', () => {
    it('loads tasks from local storage', async () => {
      // Setup
      (TodoStorage.getTodos as jest.Mock).mockResolvedValueOnce([...mockTasks]);
      const todoService = new TodoService(mockConfig);
      
      // Execute
      const result = await todoService.init();
      
      // Verify
      expect(TodoStorage.getTodos).toHaveBeenCalled();
      expect(result.tasks).toEqual(mockTasks);
    });

    it('handles errors during initialization', async () => {
      // Setup
      (TodoStorage.getTodos as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));
      const todoService = new TodoService(mockConfig);
      
      // Execute
      const result = await todoService.init();
      
      // Verify
      expect(TodoStorage.getTodos).toHaveBeenCalled();
      expect(result.tasks).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        'Error initializing tasks:',
        expect.any(Error)
      );
    });
  });

  describe('addTask', () => {
    it('adds a new task to the beginning of the list', async () => {
      // Setup
      (TodoStorage.getTodos as jest.Mock).mockResolvedValueOnce([...mockTasks]);
      (TodoStorage.saveTodos as jest.Mock).mockResolvedValueOnce(undefined);
      const todoService = new TodoService(mockConfig);
      await todoService.init();
      
      // Execute
      const title = 'New Task';
      const result = await todoService.addTask(title);
      
      // Verify
      expect(result.tasks[0].title).toBe(title);
      expect(result.tasks[0].completed).toBe(false);
      expect(result.tasks[0].id).toMatch(/^task_/);
      expect(result.tasks.length).toBe(mockTasks.length + 1);
      expect(TodoStorage.saveTodos).toHaveBeenCalled();
    });

    it('handles errors when adding a task', async () => {
      // Setup
      (TodoStorage.getTodos as jest.Mock).mockResolvedValueOnce([...mockTasks]);
      (TodoStorage.saveTodos as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));
      const todoService = new TodoService(mockConfig);
      await todoService.init();
      
      // Execute & Verify
      await expect(todoService.addTask('New Task')).rejects.toThrow('Storage error');
      expect(console.error).toHaveBeenCalledWith(
        'Error adding task:',
        expect.any(Error)
      );
    });
  });

  describe('editTask', () => {
    it('updates an existing task', async () => {
      // Setup
      (TodoStorage.getTodos as jest.Mock).mockResolvedValueOnce([...mockTasks]);
      (TodoStorage.saveTodos as jest.Mock).mockResolvedValueOnce(undefined);
      const todoService = new TodoService(mockConfig);
      await todoService.init();
      
      // Execute
      const updates = {
        title: 'Updated Task',
        completed: true
      };
      const result = await todoService.editTask('task_123', updates);
      
      // Verify
      const updatedTask = result.tasks.find(t => t.id === 'task_123');
      expect(updatedTask).toBeDefined();
      expect(updatedTask?.title).toBe('Updated Task');
      expect(updatedTask?.completed).toBe(true);
      expect(TodoStorage.saveTodos).toHaveBeenCalled();
    });

    it('throws an error if task is not found', async () => {
      // Setup
      (TodoStorage.getTodos as jest.Mock).mockResolvedValueOnce([...mockTasks]);
      const todoService = new TodoService(mockConfig);
      await todoService.init();
      
      // Execute & Verify
      await expect(todoService.editTask('non_existent', { title: 'Updated' }))
        .rejects.toThrow('Task not found: non_existent');
      expect(console.error).toHaveBeenCalledWith(
        'Error editing task:',
        expect.any(Error)
      );
    });
  });

  describe('deleteTask', () => {
    it('removes a task from the list', async () => {
      // Setup
      (TodoStorage.getTodos as jest.Mock).mockResolvedValueOnce([...mockTasks]);
      (TodoStorage.saveTodos as jest.Mock).mockResolvedValueOnce(undefined);
      const todoService = new TodoService(mockConfig);
      await todoService.init();
      
      // Execute
      const result = await todoService.deleteTask('task_123');
      
      // Verify
      expect(result.tasks.find(t => t.id === 'task_123')).toBeUndefined();
      expect(result.tasks.length).toBe(0);
      expect(TodoStorage.saveTodos).toHaveBeenCalled();
    });

    it('throws an error if task is not found', async () => {
      // Setup
      (TodoStorage.getTodos as jest.Mock).mockResolvedValueOnce([...mockTasks]);
      const todoService = new TodoService(mockConfig);
      await todoService.init();
      
      // Execute & Verify
      await expect(todoService.deleteTask('non_existent'))
        .rejects.toThrow('Task not found: non_existent');
      expect(console.error).toHaveBeenCalledWith(
        'Error deleting task:',
        expect.any(Error)
      );
    });
  });

  describe('clearStorage', () => {
    it('clears all tasks from storage', async () => {
      // Setup
      (TodoStorage.clearTodos as jest.Mock).mockResolvedValueOnce(undefined);
      const todoService = new TodoService(mockConfig);
      
      // Execute
      await todoService.clearStorage();
      
      // Verify
      expect(TodoStorage.clearTodos).toHaveBeenCalled();
    });

    it('handles errors when clearing storage', async () => {
      // Setup
      (TodoStorage.clearTodos as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));
      const todoService = new TodoService(mockConfig);
      
      // Execute & Verify
      await expect(todoService.clearStorage()).rejects.toThrow('Storage error');
      expect(console.error).toHaveBeenCalledWith(
        'Error clearing storage:',
        expect.any(Error)
      );
    });
  });

  describe('fetchTasks', () => {
    // Mock global fetch
    const originalFetch = global.fetch;
    let fetchMock: jest.Mock;
    
    beforeEach(() => {
      fetchMock = jest.fn();
      global.fetch = fetchMock;
    });
    
    afterEach(() => {
      global.fetch = originalFetch;
    });

    it('fetches tasks from API and merges with local tasks', async () => {
      // Setup
      const mockApiResponse = {
        todos: [
          {
            id: 1,
            todo: 'API Task 1',
            completed: false,
            userId: 1
          }
        ]
      };
      
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockApiResponse)
      });
      
      (TodoStorage.getTodos as jest.Mock).mockResolvedValueOnce([...mockTasks]);
      (TodoStorage.saveTodos as jest.Mock).mockResolvedValueOnce(undefined);
      
      const todoService = new TodoService(mockConfig);
      await todoService.init();
      
      // Execute
      const result = await todoService.fetchTasks();
      
      // Verify
      expect(fetchMock).toHaveBeenCalledWith(
        'https://dummyjson.com/todos/user/1'
      );
      
      // Should have both local and API tasks
      expect(result.tasks.length).toBeGreaterThan(mockTasks.length);
      expect(TodoStorage.saveTodos).toHaveBeenCalled();
    });

    it('handles API error responses', async () => {
      // Setup
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 404
      });
      
      (TodoStorage.getTodos as jest.Mock).mockResolvedValueOnce([...mockTasks]);
      const todoService = new TodoService(mockConfig);
      await todoService.init();
      
      // Execute & Verify
      await expect(todoService.fetchTasks()).rejects.toThrow('API error: 404');
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching tasks:',
        expect.any(Error)
      );
    });
  });
});

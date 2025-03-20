import { TodoStorage } from '../todoStorage';
import { mockTodos } from '../../../__mocks__/mockData';
import { Todo } from '../../store/types';

// Import the mocked Realm module
jest.mock('realm');
import Realm from 'realm';

describe('TodoStorage', () => {
  // Get the mock Realm instance
  const mockRealm = (Realm as any)._mockRealmInstance;
  
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
    
    // Set up mock collection for objects() method
    const mockCollection = Array.from(mockTodos).map(task => ({
      id: task.id,
      title: task.title,
      completed: task.completed,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }));
    
    // Add Array.from support
    Object.defineProperty(mockCollection, 'forEach', {
      value: jest.fn(callback => mockTodos.forEach(callback)),
    });
    
    mockRealm.objects.mockReturnValue(mockCollection);
    
    // Reset the static realm instance
    (TodoStorage as any).realm = null;
  });
  
  afterEach(() => {
    // Reset the static realm instance
    (TodoStorage as any).realm = null;
  });
  
  describe('getTodos', () => {
    it('returns tasks from Realm database', async () => {
      // Execute
      const result = await TodoStorage.getTodos();
      
      // Verify
      expect(mockRealm.objects).toHaveBeenCalledWith('Todo');
      expect(result).toHaveLength(mockTodos.length);
      expect(result[0]).toHaveProperty('id', mockTodos[0].id);
      expect(result[0]).toHaveProperty('title', mockTodos[0].title);
    });
    
    it('returns empty array when no tasks in database', async () => {
      // Setup
      mockRealm.objects.mockReturnValueOnce([]);
      
      // Execute
      const result = await TodoStorage.getTodos();
      
      // Verify
      expect(mockRealm.objects).toHaveBeenCalledWith('Todo');
      expect(result).toEqual([]);
    });
    
    it('handles Realm errors gracefully', async () => {
      // Setup
      mockRealm.objects.mockImplementationOnce(() => {
        throw new Error('Realm error');
      });
      
      // Execute
      const result = await TodoStorage.getTodos();
      
      // Verify
      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        'Error getting tasks from Realm:',
        expect.any(Error)
      );
    });
  });
  
  describe('saveTodos', () => {
    it('saves tasks to Realm database', async () => {
      // Execute
      await TodoStorage.saveTodos(mockTodos);
      
      // Verify
      expect(mockRealm.write).toHaveBeenCalled();
      expect(mockRealm.delete).toHaveBeenCalled();
      expect(mockRealm.create).toHaveBeenCalledTimes(mockTodos.length);
    });
    
    it('throws error when Realm fails', async () => {
      // Setup
      const error = new Error('Realm error');
      mockRealm.write.mockImplementationOnce(() => {
        throw error;
      });
      
      // Execute & Verify
      await expect(TodoStorage.saveTodos(mockTodos)).rejects.toThrow('Realm error');
      expect(console.error).toHaveBeenCalledWith(
        'Error saving tasks to Realm:',
        error
      );
    });
    
    it('handles empty array correctly', async () => {
      // Execute
      await TodoStorage.saveTodos([]);
      
      // Verify
      expect(mockRealm.write).toHaveBeenCalled();
      expect(mockRealm.delete).toHaveBeenCalled();
      expect(mockRealm.create).not.toHaveBeenCalled();
    });
  });
  
  describe('addTodo', () => {
    it('adds a single todo to Realm database', async () => {
      // Setup
      const newTodo = mockTodos[0];
      
      // Execute
      await TodoStorage.addTodo(newTodo);
      
      // Verify
      expect(mockRealm.write).toHaveBeenCalled();
      expect(mockRealm.create).toHaveBeenCalledWith('Todo', {
        id: newTodo.id,
        title: newTodo.title,
        completed: newTodo.completed,
        createdAt: newTodo.createdAt,
        updatedAt: newTodo.updatedAt,
      });
    });
    
    it('throws error when Realm fails', async () => {
      // Setup
      const error = new Error('Realm error');
      mockRealm.write.mockImplementationOnce(() => {
        throw error;
      });
      
      // Execute & Verify
      await expect(TodoStorage.addTodo(mockTodos[0])).rejects.toThrow('Realm error');
      expect(console.error).toHaveBeenCalledWith(
        'Error adding task to Realm:',
        error
      );
    });
  });
  
  describe('updateTodo', () => {
    it('updates a todo in Realm database', async () => {
      // Setup
      const taskId = mockTodos[0].id;
      const updates = { title: 'Updated Title', completed: true };
      mockRealm.objectForPrimaryKey.mockReturnValueOnce({
        title: mockTodos[0].title,
        completed: mockTodos[0].completed,
        updatedAt: mockTodos[0].updatedAt,
      });
      
      // Execute
      await TodoStorage.updateTodo(taskId, updates);
      
      // Verify
      expect(mockRealm.write).toHaveBeenCalled();
      expect(mockRealm.objectForPrimaryKey).toHaveBeenCalledWith('Todo', taskId);
    });
    
    it('does nothing if todo not found', async () => {
      // Setup
      mockRealm.objectForPrimaryKey.mockReturnValueOnce(null);
      
      // Execute
      await TodoStorage.updateTodo('non-existent-id', { title: 'New Title' });
      
      // Verify
      expect(mockRealm.objectForPrimaryKey).toHaveBeenCalledWith('Todo', 'non-existent-id');
      expect(mockRealm.write).not.toHaveBeenCalled();
    });
    
    it('throws error when Realm fails', async () => {
      // Setup
      const error = new Error('Realm error');
      mockRealm.objectForPrimaryKey.mockImplementationOnce(() => {
        throw error;
      });
      
      // Execute & Verify
      await expect(TodoStorage.updateTodo('id', { title: 'New' })).rejects.toThrow('Realm error');
      expect(console.error).toHaveBeenCalledWith(
        'Error updating task in Realm:',
        error
      );
    });
  });
  
  describe('deleteTodo', () => {
    it('deletes a todo from Realm database', async () => {
      // Setup
      const taskId = mockTodos[0].id;
      const todoObject = { id: taskId };
      mockRealm.objectForPrimaryKey.mockReturnValueOnce(todoObject);
      
      // Execute
      await TodoStorage.deleteTodo(taskId);
      
      // Verify
      expect(mockRealm.write).toHaveBeenCalled();
      expect(mockRealm.objectForPrimaryKey).toHaveBeenCalledWith('Todo', taskId);
      expect(mockRealm.delete).toHaveBeenCalledWith(todoObject);
    });
    
    it('does nothing if todo not found', async () => {
      // Setup
      mockRealm.objectForPrimaryKey.mockReturnValueOnce(null);
      
      // Execute
      await TodoStorage.deleteTodo('non-existent-id');
      
      // Verify
      expect(mockRealm.objectForPrimaryKey).toHaveBeenCalledWith('Todo', 'non-existent-id');
      expect(mockRealm.write).not.toHaveBeenCalled();
    });
    
    it('throws error when Realm fails', async () => {
      // Setup
      const error = new Error('Realm error');
      mockRealm.objectForPrimaryKey.mockImplementationOnce(() => {
        throw error;
      });
      
      // Execute & Verify
      await expect(TodoStorage.deleteTodo('id')).rejects.toThrow('Realm error');
      expect(console.error).toHaveBeenCalledWith(
        'Error deleting task from Realm:',
        error
      );
    });
  });
  
  describe('clearTodos', () => {
    it('removes all todos from Realm database', async () => {
      // Setup
      const allTodos = mockTodos.map(task => ({ ...task }));
      mockRealm.objects.mockReturnValueOnce(allTodos);
      
      // Execute
      await TodoStorage.clearTodos();
      
      // Verify
      expect(mockRealm.write).toHaveBeenCalled();
      expect(mockRealm.objects).toHaveBeenCalledWith('Todo');
      expect(mockRealm.delete).toHaveBeenCalledWith(allTodos);
    });
    
    it('throws error when Realm fails', async () => {
      // Setup
      const error = new Error('Realm error');
      mockRealm.write.mockImplementationOnce(() => {
        throw error;
      });
      
      // Execute & Verify
      await expect(TodoStorage.clearTodos()).rejects.toThrow('Realm error');
      expect(console.error).toHaveBeenCalledWith(
        'Error clearing tasks from Realm:',
        error
      );
    });
  });
  
  describe('closeRealm', () => {
    it('closes the Realm instance if it exists and is not closed', () => {
      // Setup
      (TodoStorage as any).realm = mockRealm;
      mockRealm.isClosed = false;
      
      // Execute
      TodoStorage.closeRealm();
      
      // Verify
      expect(mockRealm.close).toHaveBeenCalled();
    });
    
    it('does nothing if Realm instance is already closed', () => {
      // Setup
      (TodoStorage as any).realm = mockRealm;
      mockRealm.isClosed = true;
      
      // Execute
      TodoStorage.closeRealm();
      
      // Verify
      expect(mockRealm.close).not.toHaveBeenCalled();
    });
    
    it('does nothing if Realm instance does not exist', () => {
      // Setup
      (TodoStorage as any).realm = null;
      
      // Execute
      TodoStorage.closeRealm();
      
      // Verify
      expect(mockRealm.close).not.toHaveBeenCalled();
    });
  });
});

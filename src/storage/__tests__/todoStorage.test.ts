import AsyncStorage from '@react-native-async-storage/async-storage';
import { TodoStorage } from '../todoStorage';
import { mockTodos } from '../../../__mocks__/mockData';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

describe('TodoStorage', () => {
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
  
  const STORAGE_KEY = '@TodoApp:tasks';
  
  describe('getTodos', () => {
    it('returns parsed tasks from AsyncStorage', async () => {
      // Setup
      const mockStoredTasks = JSON.stringify(mockTodos);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(mockStoredTasks);
      
      // Execute
      const result = await TodoStorage.getTodos();
      
      // Verify
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
      expect(result).toEqual(mockTodos);
    });
    
    it('returns empty array when no tasks in storage', async () => {
      // Setup
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
      
      // Execute
      const result = await TodoStorage.getTodos();
      
      // Verify
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
      expect(result).toEqual([]);
    });
    
    it('handles JSON parse errors gracefully', async () => {
      // Setup
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('invalid-json');
      
      // Execute
      const result = await TodoStorage.getTodos();
      
      // Verify
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        'Error getting tasks from storage:',
        expect.any(Error)
      );
    });
    
    it('handles AsyncStorage errors gracefully', async () => {
      // Setup
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));
      
      // Execute
      const result = await TodoStorage.getTodos();
      
      // Verify
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        'Error getting tasks from storage:',
        expect.any(Error)
      );
    });
  });
  
  describe('saveTodos', () => {
    it('saves tasks to AsyncStorage as JSON string', async () => {
      // Setup
      (AsyncStorage.setItem as jest.Mock).mockResolvedValueOnce(undefined);
      
      // Execute
      await TodoStorage.saveTodos(mockTodos);
      
      // Verify
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        JSON.stringify(mockTodos)
      );
    });
    
    it('throws error when AsyncStorage fails', async () => {
      // Setup
      const error = new Error('Storage error');
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(error);
      
      // Execute & Verify
      await expect(TodoStorage.saveTodos(mockTodos)).rejects.toThrow('Storage error');
      expect(console.error).toHaveBeenCalledWith(
        'Error saving tasks to storage:',
        error
      );
    });
    
    it('handles empty array correctly', async () => {
      // Setup
      (AsyncStorage.setItem as jest.Mock).mockResolvedValueOnce(undefined);
      
      // Execute
      await TodoStorage.saveTodos([]);
      
      // Verify
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        '[]'
      );
    });
  });
  
  describe('clearTodos', () => {
    it('removes tasks from AsyncStorage', async () => {
      // Setup
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValueOnce(undefined);
      
      // Execute
      await TodoStorage.clearTodos();
      
      // Verify
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
    });
    
    it('throws error when AsyncStorage fails', async () => {
      // Setup
      const error = new Error('Storage error');
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValueOnce(error);
      
      // Execute & Verify
      await expect(TodoStorage.clearTodos()).rejects.toThrow('Storage error');
      expect(console.error).toHaveBeenCalledWith(
        'Error clearing tasks from storage:',
        error
      );
    });
  });
  
  describe('integration between methods', () => {
    it('can save and then retrieve the same data', async () => {
      // Setup
      (AsyncStorage.setItem as jest.Mock).mockResolvedValueOnce(undefined);
      (AsyncStorage.getItem as jest.Mock).mockImplementation(() => {
        return Promise.resolve(JSON.stringify(mockTodos));
      });
      
      // Execute
      await TodoStorage.saveTodos(mockTodos);
      const retrievedTodos = await TodoStorage.getTodos();
      
      // Verify
      expect(retrievedTodos).toEqual(mockTodos);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        JSON.stringify(mockTodos)
      );
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
    });
    
    it('returns empty array after clearing storage', async () => {
      // Setup
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValueOnce(undefined);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
      
      // Execute
      await TodoStorage.clearTodos();
      const retrievedTodos = await TodoStorage.getTodos();
      
      // Verify
      expect(retrievedTodos).toEqual([]);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
    });
  });
});

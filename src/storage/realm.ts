import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StoredTodo {
  _id: string;
  text: string;
  completed: boolean;
  date: string;
}

const STORAGE_KEY = '@TodoApp:todos';

export const storage = {
  async getTodos(): Promise<StoredTodo[]> {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      const todos = storedData ? JSON.parse(storedData) : [];
      
      // Ensure no duplicate IDs
      const seen = new Set<string>();
      const uniqueTodos = todos.filter((todo: StoredTodo) => {
        if (seen.has(todo._id)) {
          console.warn('Duplicate todo ID found in storage:', todo._id, 'Todo:', todo);
          return false;
        }
        seen.add(todo._id);
        return true;
      });

      // If we found duplicates, update storage
      if (uniqueTodos.length !== todos.length) {
        console.warn('Storage cleanup - Original todos:', todos);
        console.warn('Storage cleanup - Unique todos:', uniqueTodos);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(uniqueTodos));
      }

      return uniqueTodos;
    } catch (error) {
      console.error('Error reading todos:', error);
      return [];
    }
  },

  async addTodo(todo: StoredTodo): Promise<void> {
    try {
      console.log('Adding todo:', todo);
      const todos = await this.getTodos();
      // Remove any existing todo with the same ID
      const filteredTodos = todos.filter(t => t._id !== todo._id);
      if (filteredTodos.length !== todos.length) {
        console.warn('Removed existing todo with ID:', todo._id);
      }
      const updatedTodos = [todo, ...filteredTodos];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTodos));
    } catch (error) {
      console.error('Error adding todo:', error);
      throw error;
    }
  },

  async updateTodo(todo: StoredTodo): Promise<void> {
    try {
      console.log('Updating todo:', todo);
      const todos = await this.getTodos();
      // Ensure we don't create duplicates during update
      const existingTodoIndex = todos.findIndex(t => t._id === todo._id);
      if (existingTodoIndex !== -1) {
        console.log('Updating existing todo at index:', existingTodoIndex);
        todos[existingTodoIndex] = todo;
      } else {
        console.warn('Todo not found for update, adding to start:', todo._id);
        todos.unshift(todo);
      }
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
      console.error('Error updating todo:', error);
      throw error;
    }
  },

  async deleteTodo(id: string): Promise<void> {
    try {
      console.log('Deleting todo:', id);
      const todos = await this.getTodos();
      const updatedTodos = todos.filter(t => t._id !== id);
      if (updatedTodos.length === todos.length) {
        console.warn('No todo found to delete with ID:', id);
      }
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTodos));
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw error;
    }
  },

  async deleteAllTodos(): Promise<void> {
    try {
      console.log('Deleting all todos');
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error deleting all todos:', error);
      throw error;
    }
  },
};

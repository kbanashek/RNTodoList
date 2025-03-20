import Realm from 'realm';
import { Todo } from '../store/types';

// Define the Realm schema for Todo
class TodoSchema extends Realm.Object<TodoSchema> {
  id!: string;
  title!: string;
  completed!: boolean;
  createdAt!: string;
  updatedAt!: string;

  static schema = {
    name: 'Todo',
    primaryKey: 'id',
    properties: {
      id: 'string',
      title: 'string',
      completed: 'bool',
      createdAt: 'string',
      updatedAt: 'string',
    },
  };
}

export class TodoStorage {
  private static realm: Realm | null = null;

  private static async getRealm(): Promise<Realm> {
    if (!this.realm) {
      this.realm = await Realm.open({
        schema: [TodoSchema],
        schemaVersion: 1,
      });
    }
    return this.realm;
  }

  static async getTodos(): Promise<Todo[]> {
    try {
      const realm = await this.getRealm();
      const realmTodos = realm.objects<TodoSchema>('Todo');
      
      // Convert Realm objects to plain JS objects
      return Array.from(realmTodos).map(todo => ({
        id: todo.id,
        title: todo.title,
        completed: todo.completed,
        createdAt: todo.createdAt,
        updatedAt: todo.updatedAt,
      }));
    } catch (error) {
      console.error('Error getting tasks from Realm:', error);
      return [];
    }
  }

  static async saveTodos(tasks: Todo[]): Promise<void> {
    try {
      const realm = await this.getRealm();
      
      realm.write(() => {
        // Clear existing todos
        const existingTodos = realm.objects('Todo');
        realm.delete(existingTodos);
        
        // Add new todos
        tasks.forEach(task => {
          realm.create('Todo', {
            id: task.id,
            title: task.title,
            completed: task.completed,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
          });
        });
      });
    } catch (error) {
      console.error('Error saving tasks to Realm:', error);
      throw error;
    }
  }

  static async addTodo(task: Todo): Promise<void> {
    try {
      const realm = await this.getRealm();
      
      realm.write(() => {
        realm.create('Todo', {
          id: task.id,
          title: task.title,
          completed: task.completed,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
        });
      });
    } catch (error) {
      console.error('Error adding task to Realm:', error);
      throw error;
    }
  }

  static async updateTodo(taskId: string, updates: Partial<Todo>): Promise<void> {
    try {
      const realm = await this.getRealm();
      const todo = realm.objectForPrimaryKey<TodoSchema>('Todo', taskId);
      
      if (todo) {
        realm.write(() => {
          if (updates.title !== undefined) {
            todo.title = updates.title;
          }
          if (updates.completed !== undefined) {
            todo.completed = updates.completed;
          }
          todo.updatedAt = new Date().toISOString();
        });
      }
    } catch (error) {
      console.error('Error updating task in Realm:', error);
      throw error;
    }
  }

  static async deleteTodo(taskId: string): Promise<void> {
    try {
      const realm = await this.getRealm();
      const todo = realm.objectForPrimaryKey<TodoSchema>('Todo', taskId);
      
      if (todo) {
        realm.write(() => {
          realm.delete(todo);
        });
      }
    } catch (error) {
      console.error('Error deleting task from Realm:', error);
      throw error;
    }
  }

  static async clearTodos(): Promise<void> {
    try {
      const realm = await this.getRealm();
      
      realm.write(() => {
        const allTodos = realm.objects('Todo');
        realm.delete(allTodos);
      });
    } catch (error) {
      console.error('Error clearing tasks from Realm:', error);
      throw error;
    }
  }

  static closeRealm(): void {
    if (this.realm && !this.realm.isClosed) {
      this.realm.close();
      this.realm = null;
    }
  }
}

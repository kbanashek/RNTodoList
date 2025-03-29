import { Todo, TodoServiceConfig } from '../store/types';
import { TodoStorage } from '../storage';

export class TodoService {
  private tasks: Todo[] = [];
  private hasLoadedFromStorage = false;

  constructor(private readonly API_CONFIG: TodoServiceConfig) {}

  public async init(): Promise<{ tasks: Todo[] }> {
    try {
      this.tasks = await TodoStorage.getTodos();
      this.hasLoadedFromStorage = true;
      return { tasks: [...this.tasks] };
    } catch (error) {
      console.error('Error initializing tasks:', error);
      return { tasks: [] };
    }
  }

  public async fetchTasks(): Promise<{ tasks: Todo[] }> {
    try {
      // First load local tasks if we haven't already
      if (!this.hasLoadedFromStorage) {
        await this.init();
      }

      const response = await fetch(
        `${this.API_CONFIG.baseUrl}/todos/user/${this.API_CONFIG.userId}`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data || !Array.isArray(data.todos)) {
        throw new Error('Invalid API response format');
      }

      // Map API response to our Task format
      const apiTasks = data.todos.map((task: any) => ({
        id: String(task.id),
        title: task.todo,
        completed: task.completed,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dueDate: null,
        reminderDate: null,
        reminderEnabled: false,
      }));

      // Merge API tasks with local tasks
      // Keep local tasks that have custom IDs (they start with 'task_')
      const localTasks = this.tasks.filter(task => task.id.startsWith('task_'));
      this.tasks = [...localTasks, ...apiTasks];

      // Save merged tasks to storage using individual CRUD operations
      for (const task of this.tasks) {
        if (localTasks.includes(task)) {
          // Update existing task
          await TodoStorage.updateTodo(task.id, task);
        } else {
          // Add new task
          await TodoStorage.addTodo(task);
        }
      }

      return { tasks: [...this.tasks] };
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  public async addTask(title: string): Promise<{ tasks: Todo[] }> {
    try {
      const now = new Date().toISOString();
      const taskId = this.generateId('task');

      const newTask: Todo = {
        id: taskId,
        title,
        completed: false,
        createdAt: now,
        updatedAt: now,
        dueDate: null,
        reminderDate: null,
        reminderEnabled: false,
      };

      // Add the new task to Realm
      await TodoStorage.addTodo(newTask);

      // Update our local array
      this.tasks = [newTask, ...this.tasks];

      return { tasks: [...this.tasks] };
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  }

  public async editTask(taskId: string, updates: Partial<Todo>): Promise<{ tasks: Todo[] }> {
    try {
      const taskIndex = this.tasks.findIndex(t => t.id === taskId);

      if (taskIndex === -1) {
        throw new Error(`Task not found: ${taskId}`);
      }

      // Update the task in Realm
      await TodoStorage.updateTodo(taskId, updates);

      // Update our local array
      const updatedTask = {
        ...this.tasks[taskIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      this.tasks = [
        ...this.tasks.slice(0, taskIndex),
        updatedTask,
        ...this.tasks.slice(taskIndex + 1),
      ];

      return { tasks: [...this.tasks] };
    } catch (error) {
      console.error('Error editing task:', error);
      throw error;
    }
  }

  public async deleteTask(taskId: string): Promise<{ tasks: Todo[] }> {
    try {
      const taskIndex = this.tasks.findIndex(t => t.id === taskId);

      if (taskIndex === -1) {
        throw new Error(`Task not found: ${taskId}`);
      }

      // Delete the task from Realm
      await TodoStorage.deleteTodo(taskId);

      // Update our local array
      this.tasks = [...this.tasks.slice(0, taskIndex), ...this.tasks.slice(taskIndex + 1)];

      return { tasks: [...this.tasks] };
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public async clearStorage(): Promise<void> {
    try {
      await TodoStorage.clearTodos();
      this.tasks = [];
      this.hasLoadedFromStorage = false;
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  public closeDatabase(): void {
    TodoStorage.closeRealm();
  }
}

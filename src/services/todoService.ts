import AsyncStorage from "@react-native-async-storage/async-storage";
import { Task, TodoServiceConfig } from "../store/types";

const SAMPLE_TASKS: Task[] = [
  {
    id: "sample_1",
    title: "Welcome to Todo App! 👋",
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sample_2",
    title: "✨ Try adding a new task above",
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sample_3",
    title: "🔄 Works offline - changes sync automatically",
    completed: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export class TodoService {
  private tasks: Task[] = [];
  private readonly STORAGE_KEY = "tasks";

  constructor(private readonly API_CONFIG: TodoServiceConfig) {}

  public async init(): Promise<{ tasks: Task[] }> {
    try {
      const storedTasks = await AsyncStorage.getItem(this.STORAGE_KEY);
      
      if (storedTasks) {
        this.tasks = JSON.parse(storedTasks);
      } else {
        // Initialize with sample tasks if storage is empty
        this.tasks = SAMPLE_TASKS;
        await this.saveToStorage();
      }
      
      return { tasks: this.tasks };
    } catch (error) {
      console.error("Error initializing tasks:", error);
      // Return sample tasks as fallback
      return { tasks: SAMPLE_TASKS };
    }
  }

  public async fetchTasks(): Promise<{ tasks: Task[] }> {
    try {
      const response = await fetch(
        `${this.API_CONFIG.baseUrl}/todos/user/${this.API_CONFIG.userId}`
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();

      if (!data || !Array.isArray(data.todos)) {
        return { tasks: this.tasks };
      }

      // Map API response to our Task format
      const tasks = data.todos.map((task: any) => ({
        id: String(task.id),
        title: task.todo,
        completed: task.completed,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      // Only update if we got tasks from API
      if (tasks.length > 0) {
        this.tasks = tasks;
        await this.saveToStorage();
      }

      return { tasks: this.tasks };
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return { tasks: this.tasks };
    }
  }

  public async addTask(title: string): Promise<{ tasks: Task[] }> {
    try {
      const now = new Date().toISOString();
      const taskId = this.generateId("task");

      const newTask: Task = {
        id: taskId,
        title,
        completed: false,
        createdAt: now,
        updatedAt: now,
      };

      // Add to beginning of list
      this.tasks.unshift(newTask);
      await this.saveToStorage();

      return { tasks: this.tasks };
    } catch (error) {
      console.error("Error adding task:", error);
      throw error;
    }
  }

  public async editTask(
    taskId: string,
    updates: Partial<Task>
  ): Promise<{ tasks: Task[] }> {
    try {
      const taskIndex = this.tasks.findIndex((t) => t.id === taskId);

      if (taskIndex === -1) {
        throw new Error(`Task not found: ${taskId}`);
      }

      const updatedTask = {
        ...this.tasks[taskIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      this.tasks[taskIndex] = updatedTask;
      await this.saveToStorage();

      return { tasks: this.tasks };
    } catch (error) {
      console.error("Error editing task:", error);
      throw error;
    }
  }

  public async deleteTask(taskId: string): Promise<{ tasks: Task[] }> {
    try {
      const taskIndex = this.tasks.findIndex((t) => t.id === taskId);

      if (taskIndex === -1) {
        throw new Error(`Task not found: ${taskId}`);
      }

      this.tasks.splice(taskIndex, 1);
      await this.saveToStorage();

      return { tasks: this.tasks };
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async saveToStorage(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tasks));
    } catch (error) {
      console.error("Error saving to storage:", error);
      throw error;
    }
  }

  public async clearStorage(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      this.tasks = [];
    } catch (error) {
      console.error("Error clearing storage:", error);
      throw error;
    }
  }
}

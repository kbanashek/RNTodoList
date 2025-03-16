import { Task, TodoServiceConfig } from "../store/types";
import { TaskStorage } from "../storage";

export class TodoService {
  private tasks: Task[] = [];
  private hasLoadedFromStorage = false;

  constructor(private readonly API_CONFIG: TodoServiceConfig) {}

  public async init(): Promise<{ tasks: Task[] }> {
    try {
      this.tasks = await TaskStorage.getTasks();
      this.hasLoadedFromStorage = true;
      return { tasks: [...this.tasks] };
    } catch (error) {
      console.error("Error initializing tasks:", error);
      return { tasks: [] };
    }
  }

  public async fetchTasks(): Promise<{ tasks: Task[] }> {
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
        throw new Error("Invalid API response format");
      }

      // Map API response to our Task format
      const apiTasks = data.todos.map((task: any) => ({
        id: String(task.id),
        title: task.todo,
        completed: task.completed,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      // Merge API tasks with local tasks
      // Keep local tasks that have custom IDs (they start with 'task_')
      const localTasks = this.tasks.filter(task => task.id.startsWith('task_'));
      this.tasks = [...localTasks, ...apiTasks];

      // Save merged tasks to storage
      await TaskStorage.saveTasks(this.tasks);
      return { tasks: [...this.tasks] };
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
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

      // Create new array with the new task at the beginning
      this.tasks = [newTask, ...this.tasks];
      await TaskStorage.saveTasks(this.tasks);

      return { tasks: [...this.tasks] };
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

      // Create new array with updated task
      this.tasks = [
        ...this.tasks.slice(0, taskIndex),
        {
          ...this.tasks[taskIndex],
          ...updates,
          updatedAt: new Date().toISOString(),
        },
        ...this.tasks.slice(taskIndex + 1)
      ];

      await TaskStorage.saveTasks(this.tasks);
      return { tasks: [...this.tasks] };
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

      // Create new array without the deleted task
      this.tasks = [
        ...this.tasks.slice(0, taskIndex),
        ...this.tasks.slice(taskIndex + 1)
      ];

      await TaskStorage.saveTasks(this.tasks);
      return { tasks: [...this.tasks] };
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public async clearStorage(): Promise<void> {
    try {
      await TaskStorage.clearTasks();
      this.tasks = [];
      this.hasLoadedFromStorage = false;
    } catch (error) {
      console.error("Error clearing storage:", error);
      throw error;
    }
  }
}

import { Todo, TodoServiceConfig } from "../store/types";
import { TodoStorage } from "../storage";
import { ApiTodo, TodosResponse } from "../types/api/responses";

export class TodoService {
  private tasks: Todo[] = [];
  private hasLoadedFromStorage = false;

  constructor(private readonly API_CONFIG: TodoServiceConfig) {}

  public async init(): Promise<{ tasks: Todo[] }> {
    try {
      this.tasks = await TodoStorage.getTasks();
      this.hasLoadedFromStorage = true;
      return { tasks: this.tasks };
    } catch (error) {
      console.error("Error initializing tasks:", error);
      return { tasks: [] };
    }
  }

  public async fetchTodos(): Promise<{ tasks: Todo[] }> {
    try {
      if (!this.hasLoadedFromStorage) {
        await this.init();
      }

      const response = await fetch(
        `${this.API_CONFIG.baseUrl}/todos/user/${this.API_CONFIG.userId}`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = (await response.json()) as TodosResponse;

      if (!data || !Array.isArray(data.todos)) {
        throw new Error("Invalid API response format");
      }

      const now = new Date().toISOString();
      const apiTasks = data.todos.map((task: ApiTodo) => ({
        id: String(task.id),
        title: task.todo,
        completed: task.completed,
        createdAt: now,
        updatedAt: now,
      }));

      const localTasks = this.tasks.filter((task) =>
        task.id.startsWith("task_")
      );
      this.tasks = [...localTasks, ...apiTasks];

      await TodoStorage.saveTasks(this.tasks);
      return { tasks: this.tasks };
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
  }

  public async addTodo(title: string): Promise<{ tasks: Todo[] }> {
    try {
      const now = new Date().toISOString();
      const taskId = this.generateId("task");

      const newTask: Todo = {
        id: taskId,
        title,
        completed: false,
        createdAt: now,
        updatedAt: now,
      };

      this.tasks.unshift(newTask);
      await TodoStorage.saveTasks(this.tasks);

      return { tasks: this.tasks };
    } catch (error) {
      console.error("Error adding task:", error);
      throw error;
    }
  }

  public async editTodo(
    taskId: string,
    updates: Partial<Todo>
  ): Promise<{ tasks: Todo[] }> {
    try {
      const taskIndex = this.tasks.findIndex((t) => t.id === taskId);

      if (taskIndex === -1) {
        throw new Error(`Task not found: ${taskId}`);
      }

      const now = new Date().toISOString();
      const updatedTask = {
        ...this.tasks[taskIndex],
        ...updates,
        updatedAt: now,
      };

      this.tasks[taskIndex] = updatedTask;
      await TodoStorage.saveTasks(this.tasks);

      return { tasks: this.tasks };
    } catch (error) {
      console.error("Error editing task:", error);
      throw error;
    }
  }

  public async deleteTodo(taskId: string): Promise<{ tasks: Todo[] }> {
    try {
      const taskIndex = this.tasks.findIndex((t) => t.id === taskId);

      if (taskIndex === -1) {
        throw new Error(`Task not found: ${taskId}`);
      }

      this.tasks.splice(taskIndex, 1);
      await TodoStorage.saveTasks(this.tasks);

      return { tasks: this.tasks };
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
      await TodoStorage.clearTasks();
      this.tasks = [];
      this.hasLoadedFromStorage = false;
    } catch (error) {
      console.error("Error clearing storage:", error);
      throw error;
    }
  }
}

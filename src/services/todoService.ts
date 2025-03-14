import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Task,
  PendingChange,
  TodoServiceResult,
  SyncStatus,
  ApiTodoResponse,
} from "../types/index";

// Type guards
function isAddChange(
  change: PendingChange
): change is PendingChange & { type: "add" } {
  return change.type === "add";
}

function isUpdateChange(
  change: PendingChange
): change is PendingChange & { type: "update" } {
  return change.type === "update";
}

function isDeleteChange(
  change: PendingChange
): change is PendingChange & { type: "delete" } {
  return change.type === "delete";
}

class TodoService {
  private tasks: Task[] = [];
  private pendingChanges: PendingChange[] = [];
  private readonly STORAGE_KEY = "@todo_list";
  private readonly BASE_URL = "https://dummyjson.com/todos";
  private readonly PENDING_CHANGES_KEY = "@pending_changes";

  private readonly API_CONFIG = {
    userId: 20,
    limit: 10,
    maxRetries: 3,
    baseRetryDelay: 1000, // 1 second
  } as const;

  constructor() {
    this.loadFromStorage().catch((error) => {
      console.error("Error in constructor loading from storage:", error);
      // Initialize with empty arrays if loading fails
      this.tasks = [];
      this.pendingChanges = [];
    });
  }

  private async loadFromStorage() {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const { tasks, pendingChanges } = JSON.parse(data);
        this.tasks = tasks || [];
        this.pendingChanges = pendingChanges || [];
      }
    } catch (error) {
      console.error("Error loading from storage:", error);
      throw error; // Re-throw to be caught by constructor
    }
  }

  private async saveToStorage() {
    try {
      await AsyncStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify({
          tasks: this.tasks,
          pendingChanges: this.pendingChanges,
        })
      );
    } catch (error) {
      console.error("Error saving to storage:", error);
    }
  }

  public getTasks(): Task[] {
    return this.tasks || [];
  }

  public getPendingChanges(): PendingChange[] {
    return this.pendingChanges || [];
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now().toString()}`;
  }

  public async init(): Promise<TodoServiceResult> {
    await this.loadFromStorage();
    await this.fetchTasksFromApi();
    return {
      tasks: this.tasks,
      pendingChanges: this.pendingChanges,
    };
  }

  private async fetchTasksFromApi() {
    try {
      const url = `${this.BASE_URL}/user/${this.API_CONFIG.userId}?limit=${this.API_CONFIG.limit}`;
      console.log("Fetching tasks from API:", url);

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const data: ApiTodoResponse = await response.json();
      const apiTasks: Task[] = data.todos.map((todo) => ({
        id: todo.id.toString(),
        title: todo.todo,
        completed: todo.completed,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: "synced" as SyncStatus,
      }));

      // Merge API tasks with local tasks, prioritizing local changes
      const mergedTasks = [...apiTasks];
      this.tasks.forEach((localTask) => {
        if (!mergedTasks.find((t) => t.id === localTask.id)) {
          mergedTasks.push(localTask);
        }
      });

      this.tasks = mergedTasks;
      await this.saveOfflineData();
    } catch (error) {
      console.error("Error fetching tasks:", error);
      // Keep using offline data on error
    }
  }

  private async saveOfflineData() {
    await Promise.all([
      AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tasks)),
      AsyncStorage.setItem(
        this.PENDING_CHANGES_KEY,
        JSON.stringify(this.pendingChanges)
      ),
    ]);
  }

  public async addTask(title: string): Promise<TodoServiceResult> {
    const now = new Date().toISOString();
    const taskId = this.generateId("local");
    const newTask: Task = {
      id: taskId,
      title,
      completed: false,
      createdAt: now,
      updatedAt: now,
      syncStatus: "pending",
    };

    const pendingChange: PendingChange = {
      id: this.generateId("change"),
      type: "add",
      data: {
        todo: title,
        completed: false,
        userId: 1,
      },
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };

    this.tasks = [...(this.tasks || []), newTask];
    this.pendingChanges = [...(this.pendingChanges || []), pendingChange];
    await this.saveToStorage();

    return {
      tasks: this.tasks,
      pendingChanges: this.pendingChanges,
    };
  }

  public async updateTask(
    taskId: string,
    updates: Partial<Task>
  ): Promise<TodoServiceResult> {
    if (!this.tasks) this.tasks = [];
    const taskIndex = this.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) throw new Error("Task not found");

    const task = this.tasks[taskIndex];
    const updatedTask: Task = {
      ...task,
      ...updates,
      updatedAt: new Date().toISOString(),
      syncStatus: "pending",
    };

    const pendingChange: PendingChange = {
      id: this.generateId("change"),
      type: "update",
      entityId: taskId,
      data: {
        todo: updatedTask.title,
        completed: updatedTask.completed,
        userId: 1,
      },
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };

    this.tasks[taskIndex] = updatedTask;
    if (!this.pendingChanges) this.pendingChanges = [];
    this.pendingChanges.push(pendingChange);
    await this.saveToStorage();

    return {
      tasks: this.tasks,
      pendingChanges: this.pendingChanges,
    };
  }

  public async deleteTask(taskId: string): Promise<TodoServiceResult> {
    if (!this.tasks) this.tasks = [];
    const taskIndex = this.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) throw new Error("Task not found");

    const pendingChange: PendingChange = {
      id: this.generateId("change"),
      type: "delete",
      entityId: taskId,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      data: undefined,
    };

    this.tasks.splice(taskIndex, 1);
    if (!this.pendingChanges) this.pendingChanges = [];
    this.pendingChanges.push(pendingChange);
    await this.saveToStorage();

    return {
      tasks: this.tasks,
      pendingChanges: this.pendingChanges,
    };
  }

  private async processPendingChange(change: PendingChange): Promise<void> {
    if (!this.tasks) this.tasks = [];
    if (!this.pendingChanges) this.pendingChanges = [];

    try {
      switch (change.type) {
        case "add": {
          if (!isAddChange(change)) {
            throw new Error("Invalid add change");
          }
          const response = await fetch(this.BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(change.data),
          });
          if (!response.ok) throw new Error("Failed to add task");
          const data = await response.json();

          // Update local task with server ID
          const taskIndex = this.tasks.findIndex(
            (t) => !t.id.startsWith("server_")
          );
          if (taskIndex !== -1) {
            this.tasks[taskIndex] = {
              ...this.tasks[taskIndex],
              id: `server_${data.id}`,
              syncStatus: "synced",
            };
          }
          break;
        }
        case "update": {
          if (!isUpdateChange(change)) {
            throw new Error("Invalid update change");
          }
          const response = await fetch(`${this.BASE_URL}/${change.entityId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(change.data),
          });
          if (!response.ok) throw new Error("Failed to update task");

          // Update local task sync status
          const taskIndex = this.tasks.findIndex(
            (t) => t.id === change.entityId
          );
          if (taskIndex !== -1) {
            this.tasks[taskIndex] = {
              ...this.tasks[taskIndex],
              syncStatus: "synced",
            };
          }
          break;
        }
        case "delete": {
          if (!isDeleteChange(change)) {
            throw new Error("Invalid delete change");
          }
          const response = await fetch(`${this.BASE_URL}/${change.entityId}`, {
            method: "DELETE",
          });
          if (!response.ok) throw new Error("Failed to delete task");
          break;
        }
      }

      // Remove processed change
      const changeIndex = this.pendingChanges.findIndex(
        (c) => c.id === change.id
      );
      if (changeIndex !== -1) {
        this.pendingChanges.splice(changeIndex, 1);
      }
      await this.saveToStorage();
    } catch (error) {
      console.error("Error processing change:", error);
      change.retryCount++;
      change.lastRetry = new Date().toISOString();
      change.error = error instanceof Error ? error.message : "Unknown error";

      // Update affected task's sync status
      if ("entityId" in change) {
        const taskIndex = this.tasks.findIndex((t) => t.id === change.entityId);
        if (taskIndex !== -1) {
          this.tasks[taskIndex] = {
            ...this.tasks[taskIndex],
            syncStatus: "error",
          };
        }
      }
      await this.saveToStorage();
      throw error;
    }
  }

  public async syncTasks(): Promise<TodoServiceResult> {
    if (!this.pendingChanges) this.pendingChanges = [];
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 second

    for (const change of [...this.pendingChanges]) {
      if (change.retryCount >= MAX_RETRIES) {
        console.error(`Max retries reached for change ${change.id}`);
        continue;
      }

      try {
        await this.processPendingChange(change);
      } catch (error) {
        if (change.retryCount < MAX_RETRIES) {
          await new Promise((resolve) =>
            setTimeout(resolve, RETRY_DELAY * Math.pow(2, change.retryCount))
          );
          continue;
        }
      }
    }

    return {
      tasks: this.tasks,
      pendingChanges: this.pendingChanges,
    };
  }

  public async clearStorage(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      this.tasks = [];
      this.pendingChanges = [];
      console.log("Storage cleared successfully");
    } catch (error) {
      console.error("Error clearing storage:", error);
      throw error;
    }
  }
}

export const todoService = new TodoService();

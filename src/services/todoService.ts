import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Task,
  PendingChange,
  TodoServiceResult,
  AddChange,
  UpdateChange,
  DeleteChange,
} from "../store/types";

// Type guards
function isAddChange(change: PendingChange): change is AddChange {
  return change.type === "add";
}

function isUpdateChange(change: PendingChange): change is UpdateChange {
  return change.type === "update";
}

function isDeleteChange(change: PendingChange): change is DeleteChange {
  return change.type === "delete";
}

class TodoService {
  private tasks: Task[] = [];
  private pendingChanges: PendingChange[] = [];
  private readonly STORAGE_KEY = "@todo_list";
  private readonly PENDING_CHANGES_KEY = "@pending_changes";
  private readonly API_CONFIG = {
    userId: 20,
    limit: 10,
    maxRetries: 3,
    baseRetryDelay: 1000, // 1 second
    baseUrl: "https://dummyjson.com/todos",
  } as const;
  private initialized: boolean = false;

  private async initialize() {
    if (this.initialized) return;
    try {
      await this.loadFromStorage();
      this.initialized = true;
    } catch (error) {
      console.error("Error initializing TodoService:", error);
      this.tasks = [];
      this.pendingChanges = [];
      this.initialized = true;
    }
  }

  private async loadFromStorage(): Promise<void> {
    try {
      const [tasksJson, changesJson] = await Promise.all([
        AsyncStorage.getItem(this.STORAGE_KEY),
        AsyncStorage.getItem(this.PENDING_CHANGES_KEY),
      ]);

      this.tasks = tasksJson ? JSON.parse(tasksJson) : [];
      this.pendingChanges = changesJson ? JSON.parse(changesJson) : [];
    } catch (error) {
      console.error("Error loading from storage:", error);
      this.tasks = [];
      this.pendingChanges = [];
    }
  }

  private async saveToStorage(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tasks)),
        AsyncStorage.setItem(
          this.PENDING_CHANGES_KEY,
          JSON.stringify(this.pendingChanges)
        ),
      ]);
    } catch (error) {
      console.error("Error saving to storage:", error);
      throw error;
    }
  }

  public async getTasks(): Promise<Task[]> {
    await this.initialize();
    return this.tasks;
  }

  public async getPendingChanges(): Promise<PendingChange[]> {
    await this.initialize();
    return this.pendingChanges;
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  public async init(): Promise<TodoServiceResult> {
    try {
      await this.initialize();
      await this.fetchTasksFromApi();
      return {
        tasks: this.tasks,
        pendingChanges: this.pendingChanges,
      };
    } catch (error) {
      console.error("Error initializing TodoService:", error);
      throw error;
    }
  }

  private async fetchTasksFromApi(): Promise<void> {
    try {
      const url = `${this.API_CONFIG.baseUrl}?limit=${this.API_CONFIG.limit}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const data = await response.json();
      const apiTasks: Task[] = data.todos.map(
        (todo: { id: number; todo: string; completed: boolean }) => ({
          id: `server_${todo.id}`,
          title: todo.todo,
          completed: todo.completed,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          syncStatus: "synced",
        })
      );
      this.tasks = [
        ...apiTasks,
        ...this.tasks.filter((t) => !t.id.startsWith("server_")),
      ];
      await this.saveToStorage();
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
  }

  public async addTask(title: string): Promise<TodoServiceResult> {
    try {
      await this.initialize();
      const now = new Date().toISOString();
      const taskId = this.generateId("local");

      // Create task with pending status for proper sync state
      const newTask: Task = {
        id: taskId,
        title,
        completed: false,
        createdAt: now,
        updatedAt: now,
        syncStatus: "pending", // Show sync state to user
      };

      // Ensure tasks is always an array
      if (!Array.isArray(this.tasks)) {
        this.tasks = [];
      }

      // Add task to local storage
      this.tasks.push(newTask);

      // Queue change for later sync
      const pendingChange: AddChange = {
        id: this.generateId("change"),
        type: "add",
        entityId: taskId,
        data: {
          todo: title,
          completed: false,
          userId: this.API_CONFIG.userId,
        },
        timestamp: now,
        retryCount: 0,
      };

      if (!Array.isArray(this.pendingChanges)) {
        this.pendingChanges = [];
      }

      this.pendingChanges.push(pendingChange);
      await this.saveToStorage();

      return {
        tasks: this.tasks,
        pendingChanges: this.pendingChanges,
      };
    } catch (error) {
      console.error("Error adding task:", error);
      throw error;
    }
  }

  public async updateTask(
    taskId: string,
    updates: Partial<Task>
  ): Promise<TodoServiceResult> {
    try {
      await this.initialize();

      // Find task in local storage
      const taskIndex = this.tasks.findIndex((t) => t.id === taskId);
      if (taskIndex === -1) throw new Error("Task not found");

      const task = this.tasks[taskIndex];
      const updatedTask: Task = {
        ...task,
        ...updates,
        updatedAt: new Date().toISOString(),
        syncStatus: "pending",
      };

      // Update task in local storage
      this.tasks[taskIndex] = updatedTask;

      // Queue change for later sync
      const pendingChange: UpdateChange = {
        id: this.generateId("change"),
        type: "update",
        entityId: taskId,
        data: {
          todo: updatedTask.title,
          completed: updatedTask.completed,
          userId: this.API_CONFIG.userId,
        },
        timestamp: new Date().toISOString(),
        retryCount: 0,
      };

      this.pendingChanges.push(pendingChange);
      await this.saveToStorage();

      return {
        tasks: this.tasks,
        pendingChanges: this.pendingChanges,
      };
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  }

  public async deleteTask(taskId: string): Promise<TodoServiceResult> {
    try {
      await this.initialize();

      // Find task in local storage
      const taskIndex = this.tasks.findIndex((t) => t.id === taskId);
      if (taskIndex === -1) throw new Error("Task not found");

      // Remove task from local storage immediately
      this.tasks.splice(taskIndex, 1);

      // Queue change for later sync
      const pendingChange: DeleteChange = {
        id: this.generateId("change"),
        type: "delete",
        entityId: taskId,
        timestamp: new Date().toISOString(),
        retryCount: 0,
      };

      this.pendingChanges.push(pendingChange);
      await this.saveToStorage();

      return {
        tasks: this.tasks,
        pendingChanges: this.pendingChanges,
      };
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  }

  private async processPendingChange(change: PendingChange): Promise<void> {
    try {
      switch (change.type) {
        case "add": {
          if (isAddChange(change)) {
            const response = await fetch(this.API_CONFIG.baseUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(change.data),
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(
                errorData.message || `Failed to add task: ${response.status}`
              );
            }

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
          }
          break;
        }
        case "update": {
          if (isUpdateChange(change)) {
            const response = await fetch(
              `${this.API_CONFIG.baseUrl}/${change.entityId}`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(change.data),
              }
            );

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(
                errorData.message || `Failed to update task: ${response.status}`
              );
            }

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
          }
          break;
        }
        case "delete": {
          if (isDeleteChange(change)) {
            const response = await fetch(
              `${this.API_CONFIG.baseUrl}/${change.entityId}`,
              {
                method: "DELETE",
              }
            );

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(
                errorData.message || `Failed to delete task: ${response.status}`
              );
            }

            // Remove task from local state if it still exists
            this.tasks = this.tasks.filter((t) => t.id !== change.entityId);
          }
          break;
        }
      }

      // Remove processed change
      this.pendingChanges = this.pendingChanges.filter(
        (c) => c.id !== change.id
      );
      await this.saveToStorage();
    } catch (error) {
      console.error("Error processing pending change:", error);

      const retryDelay =
        this.API_CONFIG.baseRetryDelay * Math.pow(2, change.retryCount);

      // Update change with error and increment retry count
      const changeIndex = this.pendingChanges.findIndex(
        (c) => c.id === change.id
      );
      if (changeIndex !== -1) {
        this.pendingChanges[changeIndex] = {
          ...change,
          retryCount: (change.retryCount || 0) + 1,
          error: error instanceof Error ? error.message : String(error),
        };

        // Update related task status to error if max retries exceeded
        if (
          this.pendingChanges[changeIndex].retryCount >=
          this.API_CONFIG.maxRetries
        ) {
          const taskIndex = this.tasks.findIndex(
            (t) => t.id === change.entityId
          );
          if (taskIndex !== -1) {
            this.tasks[taskIndex] = {
              ...this.tasks[taskIndex],
              syncStatus: "error",
            };
          }
        }

        await this.saveToStorage();
      }

      throw error;
    }
  }

  public async syncTasks(): Promise<TodoServiceResult> {
    try {
      await this.initialize();

      // Process pending changes in order
      const sortedChanges = [...this.pendingChanges].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      for (const change of sortedChanges) {
        try {
          await this.processPendingChange(change);
        } catch (error) {
          console.error(`Error processing change ${change.id}:`, error);
          // Continue with next change even if this one failed
        }
      }

      return {
        tasks: this.tasks,
        pendingChanges: this.pendingChanges,
      };
    } catch (error) {
      console.error("Error syncing tasks:", error);
      throw error;
    }
  }

  public async clearStorage(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(this.STORAGE_KEY),
        AsyncStorage.removeItem(this.PENDING_CHANGES_KEY),
      ]);

      // Reset in-memory state
      this.tasks = [];
      this.pendingChanges = [];
      this.initialized = false;
    } catch (error) {
      console.error("Error clearing storage:", error);
      throw error;
    }
  }
}

export const todoService = new TodoService();

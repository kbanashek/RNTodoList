import AsyncStorage from "@react-native-async-storage/async-storage";
import { Task, PendingChange, SyncStatus } from "@types";

const TASKS_STORAGE_KEY = "@tasks";
const PENDING_CHANGES_KEY = "@pending_changes";
const API_URL = "https://dummyjson.com/todos";
const API_CONFIG = {
  userId: "20",
  limit: "5",
  maxRetries: 3,
  baseRetryDelay: 1000, // 1 second
} as const;

interface ApiTodoResponse {
  todos: Array<{
    id: number;
    todo: string;
    completed: boolean;
    userId: number;
  }>;
  total: number;
  skip: number;
  limit: number;
}

class TodoService {
  private tasks: Task[] = [];
  private pendingChanges: PendingChange<Task>[] = [];
  private initPromise: Promise<void>;

  constructor() {
    this.initPromise = this.init();
  }

  private async init() {
    try {
      await this.loadOfflineData();
      await this.fetchTasksFromApi();
    } catch (error) {
      console.error("Error initializing TodoService:", error);
      // Keep offline data on error
    }
  }

  private async loadOfflineData() {
    const [tasksData, changesData] = await Promise.all([
      AsyncStorage.getItem(TASKS_STORAGE_KEY),
      AsyncStorage.getItem(PENDING_CHANGES_KEY),
    ]);

    this.tasks = tasksData ? JSON.parse(tasksData) : [];
    this.pendingChanges = changesData ? JSON.parse(changesData) : [];
  }

  private async fetchTasksFromApi() {
    const endpoint = `${API_URL}/user/${API_CONFIG.userId}?limit=${API_CONFIG.limit}`;
    console.log("Fetching tasks from API...", endpoint);
    try {
      const response = await fetch(endpoint);
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
      AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(this.tasks)),
      AsyncStorage.setItem(
        PENDING_CHANGES_KEY,
        JSON.stringify(this.pendingChanges)
      ),
    ]);
  }

  async loadTasks(): Promise<Task[]> {
    await this.initPromise;
    return this.tasks;
  }

  getPendingChanges(): PendingChange<Task>[] {
    return this.pendingChanges;
  }

  async addTask(
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt">
  ): Promise<Task> {
    await this.initPromise;
    const now = new Date().toISOString();
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      createdAt: now,
      updatedAt: now,
      ...taskData,
      completed: taskData.completed || false,
      syncStatus: "pending" as SyncStatus,
    };

    this.tasks.push(newTask);
    this.pendingChanges.push({
      id: Math.random().toString(36).substr(2, 9),
      type: "add",
      data: newTask,
      timestamp: Date.now(),
      retryCount: 0,
    });

    await this.saveOfflineData();
    return newTask;
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    await this.initPromise;
    const taskIndex = this.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) {
      throw new Error("Task not found");
    }

    const updatedTask: Task = {
      ...this.tasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
      syncStatus: "pending" as SyncStatus,
    };

    this.tasks[taskIndex] = updatedTask;
    this.pendingChanges.push({
      id: Math.random().toString(36).substr(2, 9),
      type: "update",
      entityId: taskId,
      data: updatedTask,
      timestamp: Date.now(),
      retryCount: 0,
    });

    await this.saveOfflineData();
    return updatedTask;
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.initPromise;
    const taskIndex = this.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) {
      throw new Error("Task not found");
    }

    const deletedTask = this.tasks[taskIndex];
    this.tasks.splice(taskIndex, 1);
    this.pendingChanges.push({
      id: Math.random().toString(36).substr(2, 9),
      type: "delete",
      entityId: taskId,
      data: deletedTask,
      timestamp: Date.now(),
      retryCount: 0,
    });

    await this.saveOfflineData();
  }

  private async retryWithBackoff(
    operation: () => Promise<Response>,
    retryCount: number
  ): Promise<Response> {
    try {
      return await operation();
    } catch (error) {
      if (retryCount >= API_CONFIG.maxRetries) {
        throw error;
      }

      const delay = API_CONFIG.baseRetryDelay * Math.pow(2, retryCount);
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.retryWithBackoff(operation, retryCount + 1);
    }
  }

  async syncTasks(): Promise<void> {
    await this.initPromise;
    const sortedChanges = [...this.pendingChanges].sort(
      (a, b) => a.timestamp - b.timestamp
    );

    for (const change of sortedChanges) {
      try {
        let response: Response;
        
        switch (change.type) {
          case "add":
            response = await this.retryWithBackoff(
              () =>
                fetch(`${API_URL}`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(change.data),
                }),
              0
            );
            if (!response.ok) {
              throw new Error(`Failed to add task: ${response.statusText}`);
            }
            break;

          case "update":
            if (change.entityId && change.data) {
              response = await this.retryWithBackoff(
                () =>
                  fetch(`${API_URL}/${change.entityId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(change.data),
                  }),
                0
              );
              if (!response.ok) {
                throw new Error(`Failed to update task: ${response.statusText}`);
              }
            }
            break;

          case "delete":
            if (change.entityId) {
              response = await this.retryWithBackoff(
                () =>
                  fetch(`${API_URL}/${change.entityId}`, {
                    method: "DELETE",
                  }),
                0
              );
              if (!response.ok) {
                throw new Error(`Failed to delete task: ${response.statusText}`);
              }
            }
            break;
        }

        // Remove the successful change from pending changes
        const changeIndex = this.pendingChanges.findIndex(
          (c) => c.id === change.id
        );
        if (changeIndex !== -1) {
          this.pendingChanges.splice(changeIndex, 1);
        }

        // Update task sync status to synced on success
        if (change.type !== "delete" && change.data) {
          const taskId = change.entityId || change.data.id;
          if (taskId) {
            const taskIndex = this.tasks.findIndex((t) => t.id === taskId);
            if (taskIndex !== -1) {
              this.tasks[taskIndex].syncStatus = "synced" as SyncStatus;
            }
          }
        }

        await this.saveOfflineData();
      } catch (error) {
        console.error(`Error syncing ${change.type} change:`, error);
        
        // Update retry info in pending changes
        change.retryCount = (change.retryCount || 0) + 1;
        change.lastRetry = Date.now();
        change.error = error instanceof Error ? error.message : "Unknown error";

        // Update task sync status to error
        if (change.type !== "delete" && change.data) {
          const taskId = change.entityId || change.data.id;
          if (taskId) {
            const taskIndex = this.tasks.findIndex((t) => t.id === taskId);
            if (taskIndex !== -1) {
              this.tasks[taskIndex].syncStatus = "error" as SyncStatus;
            }
          }
        }

        await this.saveOfflineData();
        throw error;
      }
    }
  }
}

export const todoService = new TodoService();

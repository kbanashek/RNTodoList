import AsyncStorage from "@react-native-async-storage/async-storage";
import { Task, PendingChange, SyncStatus, ApiTodoRequest } from "@types";

const TASKS_STORAGE_KEY = "@tasks";
const PENDING_CHANGES_KEY = "@pending_changes";
const API_URL = "https://dummyjson.com/todos";
const API_CONFIG = {
  userId: 10,
  limit: 10,
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
  private pendingChanges: PendingChange[] = [];
  private initPromise: Promise<void>;
  private lastGeneratedId = 0;

  constructor() {
    this.initPromise = this.init();
  }

  private generateUniqueId(prefix: string): string {
    const timestamp = Date.now();
    this.lastGeneratedId += 1;
    return `${prefix}_${timestamp}_${this.lastGeneratedId}`;
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
    try {
      const url = `${API_URL}/user/${API_CONFIG.userId}?limit=${API_CONFIG.limit}`;
      console.log("Fetching tasks from API:", url);

      // https://dummyjson.com/todos/userid/10?limit=10
      // https://dummyjson.com/todos/user/20?limit=5

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

  getPendingChanges(): PendingChange[] {
    return this.pendingChanges;
  }

  async addTask(
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt">
  ): Promise<Task> {
    await this.initPromise;
    const now = new Date().toISOString();
    const newTask: Task = {
      id: this.generateUniqueId("task"),
      createdAt: now,
      updatedAt: now,
      ...taskData,
      completed: taskData.completed || false,
      syncStatus: "pending" as SyncStatus,
    };

    this.tasks.push(newTask);
    const apiData: ApiTodoRequest = {
      todo: newTask.title,
      completed: newTask.completed,
      userId: API_CONFIG.userId,
    };

    this.pendingChanges.push({
      id: this.generateUniqueId("change"),
      type: "add",
      data: apiData,
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
    const apiData: ApiTodoRequest = {
      todo: updatedTask.title,
      completed: updatedTask.completed,
      userId: API_CONFIG.userId,
    };

    this.pendingChanges.push({
      id: this.generateUniqueId("change"),
      type: "update",
      entityId: taskId,
      data: apiData,
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
    const apiData: ApiTodoRequest = {
      todo: deletedTask.title,
      completed: deletedTask.completed,
      userId: API_CONFIG.userId,
    };

    this.pendingChanges.push({
      id: this.generateUniqueId("change"),
      type: "delete",
      entityId: taskId,
      data: apiData,
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
      await new Promise((resolve) => setTimeout(resolve, delay));
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
        let taskId: string | undefined;

        switch (change.type) {
          case "add":
            response = await this.retryWithBackoff(
              () =>
                fetch(`${API_URL}/add`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    ...change.data,
                    userId: API_CONFIG.userId,
                  }),
                }),
              0
            );
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Failed to add task: ${errorText}`);
            }
            // Find the task by matching its data with the API request
            taskId = this.tasks.find(
              (t) =>
                t.title === change.data?.todo &&
                t.completed === change.data?.completed
            )?.id;
            break;

          case "update":
            taskId = change.entityId;
            if (taskId && change.data) {
              response = await this.retryWithBackoff(
                () =>
                  fetch(`${API_URL}/${taskId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      ...change.data,
                      userId: API_CONFIG.userId,
                    }),
                  }),
                0
              );
              if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to update task: ${errorText}`);
              }
            }
            break;

          case "delete":
            taskId = change.entityId;
            if (taskId) {
              response = await this.retryWithBackoff(
                () =>
                  fetch(`${API_URL}/${taskId}?userId=${API_CONFIG.userId}`, {
                    method: "DELETE",
                  }),
                0
              );
              if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to delete task: ${errorText}`);
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
        if (change.type !== "delete" && taskId) {
          const taskIndex = this.tasks.findIndex((t) => t.id === taskId);
          if (taskIndex !== -1) {
            this.tasks[taskIndex].syncStatus = "synced" as SyncStatus;
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
        if (change.type !== "delete" && change.entityId) {
          const taskIndex = this.tasks.findIndex(
            (t) => t.id === change.entityId
          );
          if (taskIndex !== -1) {
            this.tasks[taskIndex].syncStatus = "error" as SyncStatus;
          }
        }

        await this.saveOfflineData();
      }
    }
  }
}

export const todoService = new TodoService();

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
      
      // Return local data immediately for offline-first experience
      const localResult = {
        tasks: this.tasks,
        pendingChanges: this.pendingChanges,
      };

      // Start background sync if we have pending changes
      if (this.pendingChanges.length > 0) {
        this.syncTasks().catch(error => {
          console.warn('Background sync failed:', error);
          // Error is handled in syncTasks, no need to throw
        });
      }

      // Try to fetch latest data in background
      this.fetchTasksFromApi().catch(error => {
        console.warn('Background API fetch failed:', error);
        // Error is handled in fetchTasksFromApi, no need to throw
      });

      return localResult;
    } catch (error) {
      console.error("Error initializing TodoService:", error);
      // Return empty state rather than throwing
      return {
        tasks: [],
        pendingChanges: [],
      };
    }
  }

  private async fetchTasksFromApi(): Promise<void> {
    try {
      const url = `${this.API_CONFIG.baseUrl}/user/${this.API_CONFIG.userId}?limit=${this.API_CONFIG.limit}`;
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch tasks: ${errorText}`);
      }
      const data = await response.json();

      // Handle case where no todos exist yet
      if (!data.todos || !Array.isArray(data.todos)) {
        console.warn('No todos found in API response');
        return;
      }

      // Convert API tasks to our Task format with proper timestamps
      const apiTasks: Task[] = data.todos.map(
        (todo: { id: number; todo: string; completed: boolean; userId: number }) => ({
          id: `server_${todo.id}`,
          title: todo.todo,
          completed: todo.completed,
          createdAt: new Date().toISOString(), // We don't get these from the API
          updatedAt: new Date().toISOString(),
          syncStatus: 'synced',
        })
      );

      // Get all tasks that have pending changes
      const pendingTaskIds = new Set(
        this.pendingChanges
          .filter(change => change.type === 'update' || change.type === 'delete')
          .map(change => change.entityId)
      );

      // Get all local tasks that aren't from server
      const localTasks = this.tasks.filter(t => !t.id.startsWith('server_'));

      // Merge tasks, prioritizing:
      // 1. Local tasks with pending changes
      // 2. Local tasks not from server
      // 3. Server tasks that don't conflict with local tasks
      this.tasks = [
        ...this.tasks.filter(task => pendingTaskIds.has(task.id)), // Keep tasks with pending changes
        ...localTasks.filter(task => !pendingTaskIds.has(task.id)), // Keep local tasks without pending changes
        ...apiTasks.filter(task => 
          !pendingTaskIds.has(task.id) && // Don't override tasks with pending changes
          !localTasks.some(lt => lt.title === task.title) // Don't add duplicates
        ),
      ];

      await this.saveToStorage();
    } catch (error) {
      console.error('Error fetching tasks:', error);
      // Don't throw - maintain offline-first functionality
      // The app will continue with local data
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
        syncStatus: "pending",
      };

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

      this.pendingChanges.push(pendingChange);
      await this.saveToStorage();

      // Start sync process immediately in background
      this.processPendingChange(pendingChange).catch(error => {
        console.warn('Background sync failed:', error);
      });

      return {
        tasks: this.tasks,
        pendingChanges: this.pendingChanges,
      };
    } catch (error) {
      console.error("Error adding task:", error);
      throw error;
    }
  }

  public async editTask(taskId: string, updates: Partial<Task>): Promise<TodoServiceResult> {
    try {
      await this.initialize();

      const taskIndex = this.tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) {
        throw new Error(`Task not found: ${taskId}`);
      }

      const now = new Date().toISOString();
      const serverTaskId = taskId.startsWith('server_') ? taskId.replace('server_', '') : null;

      // Update task with pending status
      this.tasks[taskIndex] = {
        ...this.tasks[taskIndex],
        ...updates,
        updatedAt: now,
        syncStatus: 'pending',
      };

      // Queue change for later sync
      const pendingChange: UpdateChange = {
        id: this.generateId("change"),
        type: "update",
        entityId: taskId,
        data: {
          todo: updates.title || this.tasks[taskIndex].title,
          completed: updates.completed !== undefined ? updates.completed : this.tasks[taskIndex].completed,
          userId: this.API_CONFIG.userId,
        },
        timestamp: now,
        retryCount: 0,
      };

      this.pendingChanges.push(pendingChange);
      await this.saveToStorage();

      // Start sync process immediately in background
      this.processPendingChange(pendingChange).catch(error => {
        console.warn('Background sync failed:', error);
      });

      return {
        tasks: this.tasks,
        pendingChanges: this.pendingChanges,
      };
    } catch (error) {
      console.error("Error editing task:", error);
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

  public async syncTasks(): Promise<TodoServiceResult> {
    try {
      await this.initialize();

      // Process pending changes in chronological order
      const sortedChanges = [...this.pendingChanges].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      // Process each change with exponential backoff
      for (const change of sortedChanges) {
        try {
          // Calculate delay based on retry count
          const retryCount = change.retryCount || 0;
          if (retryCount > 0) {
            const delay = this.API_CONFIG.baseRetryDelay * Math.pow(2, retryCount - 1);
            await new Promise(resolve => setTimeout(resolve, delay));
          }

          await this.processPendingChange(change);
        } catch (error) {
          // Log error but continue processing other changes
          console.error('Error processing pending change:', error);
          // Error handling is done in processPendingChange
        }
      }

      // Return current state after sync attempts
      return {
        tasks: this.tasks,
        pendingChanges: this.pendingChanges,
      };
    } catch (error) {
      console.error('Error syncing tasks:', error);
      // Return current state even if sync failed
      return {
        tasks: this.tasks,
        pendingChanges: this.pendingChanges,
      };
    }
  }

  private async processPendingChange(change: PendingChange): Promise<void> {
    try {
      const taskId = change.entityId;
      const serverTaskId = taskId.startsWith('server_') ? taskId.replace('server_', '') : null;

      switch (change.type) {
        case "add": {
          if (isAddChange(change)) {
            // For demo purposes, simulate successful add since dummyjson doesn't support it
            const taskIndex = this.tasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
              // Add artificial delay to simulate network latency
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              this.tasks[taskIndex] = {
                ...this.tasks[taskIndex],
                syncStatus: 'synced',
                updatedAt: new Date().toISOString(),
              };
              await this.saveToStorage();
            }
          }
          break;
        }
        case "update": {
          if (isUpdateChange(change)) {
            // Add artificial delay to simulate network latency
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (serverTaskId) {
              const response = await fetch(`${this.API_CONFIG.baseUrl}/todos/${serverTaskId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(change.data),
              });

              if (!response.ok) {
                throw new Error(`Failed to update task: ${response.status}`);
              }
            }

            // Update local task sync status
            const taskIndex = this.tasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
              this.tasks[taskIndex] = {
                ...this.tasks[taskIndex],
                syncStatus: 'synced',
                updatedAt: new Date().toISOString(),
              };
              await this.saveToStorage();
            }
          }
          break;
        }
        case "delete": {
          if (isDeleteChange(change)) {
            // Add artificial delay to simulate network latency
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (serverTaskId) {
              const response = await fetch(`${this.API_CONFIG.baseUrl}/todos/${serverTaskId}`, {
                method: "DELETE",
              });

              if (!response.ok) {
                throw new Error(`Failed to delete task: ${response.status}`);
              }
            }
            // Task is already removed from this.tasks
          }
          break;
        }
      }

      // Remove the processed change
      const changeIndex = this.pendingChanges.findIndex(c => c.id === change.id);
      if (changeIndex !== -1) {
        this.pendingChanges.splice(changeIndex, 1);
        await this.saveToStorage();
      }
    } catch (error) {
      console.error('Error processing change', change.id, ':', error);
      
      // Update task sync status to error
      if (change.type !== 'delete') {
        const taskIndex = this.tasks.findIndex(t => t.id === change.entityId);
        if (taskIndex !== -1) {
          this.tasks[taskIndex] = {
            ...this.tasks[taskIndex],
            syncStatus: 'error',
            updatedAt: new Date().toISOString(),
          };
          await this.saveToStorage();
        }
      }

      // Increment retry count
      const changeIndex = this.pendingChanges.findIndex(c => c.id === change.id);
      if (changeIndex !== -1) {
        const updatedChange = {
          ...this.pendingChanges[changeIndex],
          retryCount: (this.pendingChanges[changeIndex].retryCount || 0) + 1,
        };

        // Remove change if max retries reached
        if (updatedChange.retryCount >= this.API_CONFIG.maxRetries) {
          this.pendingChanges.splice(changeIndex, 1);
        } else {
          this.pendingChanges[changeIndex] = updatedChange;
        }
        await this.saveToStorage();
      }

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

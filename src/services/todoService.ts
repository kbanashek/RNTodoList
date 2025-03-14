import AsyncStorage from "@react-native-async-storage/async-storage";
import { Task, PendingChange } from "@types";

const API_URL = "https://dummyjson.com/todos";
const TASKS_STORAGE_KEY = "@tasks";
const PENDING_CHANGES_KEY = "@pending_changes";

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
    } catch (error) {
      console.error('Error initializing TodoService:', error);
      // Initialize with empty state on error
      this.tasks = [];
      this.pendingChanges = [];
    }
  }

  private async loadOfflineData() {
    const [tasksData, changesData] = await Promise.all([
      AsyncStorage.getItem(TASKS_STORAGE_KEY),
      AsyncStorage.getItem(PENDING_CHANGES_KEY)
    ]);

    this.tasks = tasksData ? JSON.parse(tasksData) : [];
    this.pendingChanges = changesData ? JSON.parse(changesData) : [];
  }

  private async saveOfflineData() {
    await Promise.all([
      AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(this.tasks)),
      AsyncStorage.setItem(PENDING_CHANGES_KEY, JSON.stringify(this.pendingChanges))
    ]);
  }

  async loadTasks(): Promise<Task[]> {
    await this.initPromise;
    return this.tasks;
  }

  getPendingChanges(): PendingChange<Task>[] {
    return this.pendingChanges;
  }

  async addTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    await this.initPromise;
    const now = new Date().toISOString();
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      createdAt: now,
      updatedAt: now,
      ...taskData,
      completed: taskData.completed || false,
      syncStatus: 'pending'
    };

    this.tasks.push(newTask);
    this.pendingChanges.push({
      id: Math.random().toString(36).substr(2, 9),
      type: 'add',
      data: newTask,
      timestamp: Date.now(),
      retryCount: 0
    });

    await this.saveOfflineData();
    return newTask;
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    await this.initPromise;
    const taskIndex = this.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    const updatedTask: Task = {
      ...this.tasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending'
    };

    this.tasks[taskIndex] = updatedTask;
    this.pendingChanges.push({
      id: Math.random().toString(36).substr(2, 9),
      type: 'update',
      entityId: taskId,
      data: updatedTask,
      timestamp: Date.now(),
      retryCount: 0
    });

    await this.saveOfflineData();
    return updatedTask;
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.initPromise;
    const taskIndex = this.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    const deletedTask = this.tasks[taskIndex];
    this.tasks.splice(taskIndex, 1);
    this.pendingChanges.push({
      id: Math.random().toString(36).substr(2, 9),
      type: 'delete',
      entityId: taskId,
      data: deletedTask,
      timestamp: Date.now(),
      retryCount: 0
    });

    await this.saveOfflineData();
  }

  async syncTasks(): Promise<void> {
    await this.initPromise;
    const sortedChanges = [...this.pendingChanges].sort((a, b) => a.timestamp - b.timestamp);
    
    for (const change of sortedChanges) {
      try {
        switch (change.type) {
          case 'add':
            await fetch(`${API_URL}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(change.data)
            });
            break;

          case 'update':
            if (change.entityId && change.data) {
              await fetch(`${API_URL}/${change.entityId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(change.data)
              });
            }
            break;

          case 'delete':
            if (change.entityId) {
              await fetch(`${API_URL}/${change.entityId}`, {
                method: 'DELETE'
              });
            }
            break;
        }

        // Remove the successful change from pending changes
        const changeIndex = this.pendingChanges.findIndex(c => c.id === change.id);
        if (changeIndex !== -1) {
          this.pendingChanges.splice(changeIndex, 1);
        }

        // Update task sync status
        if (change.type !== 'delete' && change.data) {
          const taskId = change.entityId || change.data.id;
          if (taskId) {
            const taskIndex = this.tasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
              this.tasks[taskIndex].syncStatus = 'synced';
            }
          }
        }

        await this.saveOfflineData();
      } catch (error) {
        console.error(`Error syncing ${change.type} change:`, error);
        change.retryCount = (change.retryCount || 0) + 1;
        change.lastRetry = Date.now();
        change.error = error instanceof Error ? error.message : 'Unknown error';
        await this.saveOfflineData();
        throw error;
      }
    }
  }
}

export const todoService = new TodoService();

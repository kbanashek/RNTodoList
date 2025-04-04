// Todo Types
export type SyncStatus = "synced" | "pending" | "error";

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  syncStatus: SyncStatus;
}

// Sync Types
export interface PendingChange {
  id: string;
  type: "update" | "delete";
  entityId?: string;
  data?: {
    todo: string;
    completed: boolean;
    userId: number;
  };
  timestamp: string;
  retryCount: number;
  lastRetry?: string;
  error?: string;
}

// Service Types
export interface TodoServiceResult {
  todos: Todo[];
  pendingChanges: PendingChange[];
}

export interface UseTodosState {
  todos: Todo[];
  pendingChanges: PendingChange[];
  isLoading: boolean;
  error: Error | null;
}

// Network Types
export interface NetworkState {
  isConnected: boolean;
  connectionType: string | null;
  isInternetReachable: boolean | null;
  lastChecked: string | null;
}

// Storage Types
export interface OfflineState {
  syncStatus: SyncStatus;
  lastSync: string | null;
  pendingChanges: PendingChange[];
  isInitialSync: boolean;
  error: Error | null;
}

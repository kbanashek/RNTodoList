// Task Types
export type SyncStatus = 'synced' | 'pending' | 'error';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  syncStatus: SyncStatus;
  error?: string;
}

// API Types
export interface ApiTodoRequest {
  todo: string;
  completed: boolean;
  userId: number;
}

export interface ApiTodo {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
}

export interface ApiTodoResponse {
  todos: ApiTodo[];
  total: number;
  skip: number;
  limit: number;
}

// Sync Types
export interface BasePendingChange {
  id: string;
  timestamp: string;
  retryCount: number;
  lastRetry?: string;
  error?: string;
}

export interface AddPendingChange extends BasePendingChange {
  type: 'add';
  data: ApiTodoRequest;
}

export interface UpdatePendingChange extends BasePendingChange {
  type: 'update';
  entityId: string;
  data: ApiTodoRequest;
}

export interface DeletePendingChange extends BasePendingChange {
  type: 'delete';
  entityId: string;
  data?: never;
}

export type PendingChange = AddPendingChange | UpdatePendingChange | DeletePendingChange;

// Network Types
export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  connectionType: string | null;
  syncStatus: SyncStatus;
  lastChecked: string;
}

// Storage Types
export interface OfflineState {
  tasks: Task[];
  pendingChanges: PendingChange[];
  lastSynced: string | null;
  syncError: string | null;
  isInitialSync: boolean;
}

export interface TodoServiceResult {
  tasks: Task[];
  pendingChanges: PendingChange[];
  error?: string;
}

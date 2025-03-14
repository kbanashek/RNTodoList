export type SyncStatus = 'synced' | 'pending' | 'error';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  syncStatus: SyncStatus;
}

export interface NetworkState {
  isConnected: boolean;
  type: 'wifi' | 'cellular' | 'none';
  isInternetReachable: boolean | null;
  lastChecked?: number;
}

export interface ApiTodoRequest {
  todo: string;
  completed: boolean;
  userId: number;
}

export interface PendingChange<T = ApiTodoRequest> {
  id: string;
  type: 'add' | 'update' | 'delete';
  entityId?: string;
  data?: T;
  timestamp: number;
  retryCount: number;
  lastRetry?: number;
  error?: string;
}

export interface OfflineState {
  lastSyncTimestamp: number;
  pendingChanges: PendingChange[];
  isInitialSync: boolean;
  syncErrors: {
    changeId: string;
    error: string;
    timestamp: number;
  }[];
}

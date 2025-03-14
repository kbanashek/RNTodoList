export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'synced' | 'pending' | 'error';
}

export interface NetworkState {
  isConnected: boolean;
  type: 'wifi' | 'cellular' | 'none';
  isInternetReachable: boolean | null;
  lastChecked?: number;
}

export interface PendingChange<T> {
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
  pendingChanges: PendingChange<any>[];
  isInitialSync: boolean;
  syncErrors: {
    changeId: string;
    error: string;
    timestamp: number;
  }[];
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'synced' | 'pending' | 'error';
  error?: string; // Error message for sync failures
}

export type PendingChangeData = {
  todo: string;
  completed: boolean;
  userId: number;
};

export type PendingChangeBase = {
  id: string;
  timestamp: string;
  retryCount: number;
  error?: string;
  lastRetryTimestamp?: string; // Track last retry attempt
};

export type AddChange = PendingChangeBase & {
  type: 'add';
  entityId: string;
  data: PendingChangeData;
};

export type UpdateChange = PendingChangeBase & {
  type: 'update';
  entityId: string;
  data: PendingChangeData;
};

export type DeleteChange = PendingChangeBase & {
  type: 'delete';
  entityId: string;
};

export type PendingChange = AddChange | UpdateChange | DeleteChange;

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
  connectionType: string;
  lastCheckTimestamp: string;
}

export interface OfflineState {
  pendingChanges: PendingChange[];
  lastSyncTimestamp: string;
  isInitialSyncComplete: boolean;
  syncErrors: Array<{
    changeId: string;
    error: string;
    timestamp: string;
  }>;
}

export interface TasksState {
  tasks: Task[];
  editingTaskId: string | null;
  offline: OfflineState;
  network: NetworkState;
}

export interface RootState {
  tasks: TasksState;
}

export interface TodoServiceResult {
  tasks: Task[];
  pendingChanges: PendingChange[];
}

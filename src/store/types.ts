export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  syncStatus: NetworkStatus.Online | NetworkStatus.Pending | NetworkStatus.Error;
  error?: string; // Error message for sync failures
}

export interface AddChange {
  id: string;
  type: "add";
  entityId: string;
  data: {
    todo: string;
    completed: boolean;
    userId: number;
  };
  timestamp: string;
  retryCount: number;
  error?: string;
  lastRetryTimestamp?: string; // Track last retry attempt
}

export interface UpdateChange {
  id: string;
  type: "update";
  entityId: string;
  data: {
    todo: string;
    completed: boolean;
    userId: number;
  };
  timestamp: string;
  retryCount: number;
  error?: string;
  lastRetryTimestamp?: string; // Track last retry attempt
}

export interface DeleteChange {
  id: string;
  type: "delete";
  entityId: string;
  timestamp: string;
  retryCount: number;
  error?: string;
  lastRetryTimestamp?: string; // Track last retry attempt
}

export type PendingChange = AddChange | UpdateChange | DeleteChange;

export enum NetworkStatus {
  Error = "error",
  Pending = "pending",
  Offline = "offline",
  Limited = "limited",
  Online = "online",
}

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
  connectionType: string | null;
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

export enum NetworkType {
  NONE = "NONE",
  UNKNOWN = "UNKNOWN",
  CELLULAR = "CELLULAR",
  WIFI = "WIFI",
  BLUETOOTH = "BLUETOOTH",
  ETHERNET = "ETHERNET",
  VPN = "VPN",
  OTHER = "OTHER",
}

export interface NetworkState {
  isOffline: boolean;
  isConnected: boolean;
  isInternetReachable: boolean;
  type: NetworkType;
  lastChecked: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TodoServiceConfig {
  baseUrl: string;
  userId: number;
}

export interface TasksState {
  tasks: Task[];
  editingTaskId: string | null;
  network: NetworkState;
}

export interface RootState {
  tasks: TasksState;
}

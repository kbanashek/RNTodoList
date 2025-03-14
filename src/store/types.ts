export type NetworkType = 
  | "none"      // No connection
  | "unknown"   // Status not yet determined
  | "cellular"  // Mobile data
  | "wifi"      // WiFi connection
  | "bluetooth" // Bluetooth connection
  | "ethernet"  // Wired connection
  | "vpn"       // VPN connection
  | "other";    // Other connection types

export interface NetworkState {
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

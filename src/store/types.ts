export interface Task {
  id: string;
  text: string;
  date: string;
}

export interface TasksState {
  tasks: Task[];
  editingTaskId: string | null;
}

export interface RootState {
  tasks: TasksState;
}

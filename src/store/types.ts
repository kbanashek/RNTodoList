import { Task } from './taskSlice';

export interface TasksState {
  tasks: Task[];
  editingTaskId: string | null;
}

export interface RootState {
  tasks: TasksState;
}

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Task {
  id: string;
  text: string;
  date: string;
}

interface TaskState {
  tasks: Task[];
  editingTaskID: string | null;
}

const initialState: TaskState = {
  tasks: [],
  editingTaskID: null,
};

export const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask: (state, action: PayloadAction<{ text: string }>) => {
      const newTask: Task = {
        id: Date.now().toString(),
        text: action.payload.text,
        date: new Date().toLocaleString(),
      };
      state.tasks.push(newTask);
    },
    deleteTask: (state, action: PayloadAction<{ id: string }>) => {
      state.tasks = state.tasks.filter(task => task.id !== action.payload.id);
    },
    editTask: (state, action: PayloadAction<{ id: string; text: string }>) => {
      const task = state.tasks.find(task => task.id === action.payload.id);
      if (task) {
        task.text = action.payload.text;
      }
      state.editingTaskID = null;
    },
    setEditingTaskID: (state, action: PayloadAction<string | null>) => {
      state.editingTaskID = action.payload;
    },
  },
});

export const { addTask, deleteTask, editTask, setEditingTaskID } = taskSlice.actions;

export const selectTasks = (state: RootState) => state.tasks.tasks;
export const selectEditingTaskID = (state: RootState) => state.tasks.editingTaskID;

export interface RootState {
  tasks: TaskState;
}

export default taskSlice.reducer;

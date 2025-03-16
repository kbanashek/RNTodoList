import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task } from './types';

interface TodoState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  loadingTaskIds: string[];
}

const initialState: TodoState = {
  tasks: [],
  isLoading: false,
  error: null,
  loadingTaskIds: [],
};

export const todoSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addLoadingTaskId: (state, action: PayloadAction<string>) => {
      if (!state.loadingTaskIds.includes(action.payload)) {
        state.loadingTaskIds.push(action.payload);
      }
    },
    removeLoadingTaskId: (state, action: PayloadAction<string>) => {
      state.loadingTaskIds = state.loadingTaskIds.filter(id => id !== action.payload);
    },
  },
});

export const { setTasks, setLoading, setError, addLoadingTaskId, removeLoadingTaskId } = todoSlice.actions;
export default todoSlice.reducer;

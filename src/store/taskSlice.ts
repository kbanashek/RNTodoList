import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Task } from "@types";

interface TasksState {
  tasks: Task[];
  editingTaskID: string | null;
}

const initialState: TasksState = {
  tasks: [],
  editingTaskID: null,
};

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<Task[]>) => {
      // Keep tasks with temporary IDs and add new tasks
      const tempTasks = state.tasks.filter((task) =>
        task.id.startsWith("temp-")
      );
      const nonTempNewTasks = action.payload.filter(
        (task) => !task.id.startsWith("temp-")
      );
      state.tasks = [...tempTasks, ...nonTempNewTasks];
    },
    addTask: (state, action: PayloadAction<Task>) => {
      // Remove any existing task with the same ID
      state.tasks = state.tasks.filter((task) => task.id !== action.payload.id);
      // Add the new task at the beginning
      state.tasks.unshift(action.payload);
    },
    editTask: (
      state,
      action: PayloadAction<Partial<Task> & { id: string }>
    ) => {
      const task = state.tasks.find((t) => t.id === action.payload.id);
      if (task) {
        Object.assign(task, action.payload);
        state.editingTaskID = null;
      }
    },
    deleteTask: (state, action: PayloadAction<{ id: string }>) => {
      state.tasks = state.tasks.filter((task) => task.id !== action.payload.id);
      if (state.editingTaskID === action.payload.id) {
        state.editingTaskID = null;
      }
    },
    setEditingTaskID: (state, action: PayloadAction<string | null>) => {
      state.editingTaskID = action.payload;
    },
  },
});

export const { setTasks, addTask, editTask, deleteTask, setEditingTaskID } =
  taskSlice.actions;

export default taskSlice.reducer;

import { useCallback, useEffect, useState } from "react";
import { Task } from "../store/types";
import { TodoService } from "../services/todoService";

// Initialize with default config
const todoService = new TodoService({
  baseUrl: "https://dummyjson.com",
  userId: 20,
});

interface TasksState {
  tasks: Task[];
  isLoading: boolean;
  error: Error | null;
}

export function useTasks() {
  const [state, setState] = useState<TasksState>({
    tasks: [],
    isLoading: true,
    error: null,
  });

  const loadTasks = useCallback(async () => {
    try {
      // First load from storage
      const result = await todoService.init();
      setState((prev) => ({
        ...prev,
        tasks: result.tasks,
        isLoading: true,
      }));

      // Then fetch from API
      const apiResult = await todoService.fetchTasks();
      setState((prev) => ({
        ...prev,
        tasks: apiResult.tasks,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      console.error("Error loading tasks:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error as Error,
      }));
    }
  }, []);

  const addTask = useCallback(async (title: string) => {
    try {
      const result = await todoService.addTask(title);
      setState((prev) => ({
        ...prev,
        tasks: result.tasks,
        error: null,
      }));
    } catch (error) {
      console.error("Error adding task:", error);
      setState((prev) => ({
        ...prev,
        error: error as Error,
      }));
    }
  }, []);

  const editTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    try {
      const result = await todoService.editTask(taskId, updates);
      setState((prev) => ({
        ...prev,
        tasks: result.tasks,
        error: null,
      }));
    } catch (error) {
      console.error("Error editing task:", error);
      setState((prev) => ({
        ...prev,
        error: error as Error,
      }));
    }
  }, []);

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      const result = await todoService.deleteTask(taskId);
      setState((prev) => ({
        ...prev,
        tasks: result.tasks,
        error: null,
      }));
    } catch (error) {
      console.error("Error deleting task:", error);
      setState((prev) => ({
        ...prev,
        error: error as Error,
      }));
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return {
    tasks: state.tasks,
    isLoading: state.isLoading,
    error: state.error,
    addTask,
    editTask,
    deleteTask,
    reloadTasks: loadTasks,
  };
}

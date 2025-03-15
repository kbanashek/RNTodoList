import { useCallback, useEffect, useState } from "react";
import { Task } from "../store/types";
import { TodoService } from "../services/todoService";
import { useNetworkStatus } from "./useNetworkStatus";

interface State {
  tasks: Task[];
  isLoading: boolean;
  loadingTaskIds: Set<string>;
  error: Error | null;
}

const initialState: State = {
  tasks: [],
  isLoading: true,
  loadingTaskIds: new Set(),
  error: null,
};

const todoService = new TodoService({
  baseUrl: "https://dummyjson.com",
  userId: 1,
});

export function useTasks() {
  const [state, setState] = useState<State>(initialState);
  const networkStatus = useNetworkStatus();
  const isOnline = !networkStatus.isOffline && networkStatus.isInternetReachable;

  const loadTasks = useCallback(async () => {
    try {
      // First load from local storage
      const localResult = await todoService.init();
      setState((prev) => ({
        ...prev,
        tasks: localResult.tasks,
      }));

      // Then fetch from API if online
      if (isOnline) {
        const apiResult = await todoService.fetchTasks();
        setState((prev) => ({
          ...prev,
          tasks: apiResult.tasks,
          isLoading: false,
          error: null,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: null,
        }));
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error as Error,
      }));
    }
  }, [isOnline]);

  const addTask = useCallback(async (title: string) => {
    try {
      const result = await todoService.addTask(title);
      setState((prev) => ({
        ...prev,
        tasks: result.tasks,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error as Error,
      }));
    }
  }, []);

  const editTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    try {
      setState((prev) => ({
        ...prev,
        loadingTaskIds: new Set(prev.loadingTaskIds).add(taskId),
      }));

      const result = await todoService.editTask(taskId, updates);
      
      setState((prev) => {
        const loadingTaskIds = new Set(prev.loadingTaskIds);
        loadingTaskIds.delete(taskId);
        return {
          ...prev,
          tasks: result.tasks,
          loadingTaskIds,
        };
      });
    } catch (error) {
      setState((prev) => {
        const loadingTaskIds = new Set(prev.loadingTaskIds);
        loadingTaskIds.delete(taskId);
        return {
          ...prev,
          loadingTaskIds,
          error: error as Error,
        };
      });
    }
  }, []);

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      setState((prev) => ({
        ...prev,
        loadingTaskIds: new Set(prev.loadingTaskIds).add(taskId),
      }));

      const result = await todoService.deleteTask(taskId);
      
      setState((prev) => {
        const loadingTaskIds = new Set(prev.loadingTaskIds);
        loadingTaskIds.delete(taskId);
        return {
          ...prev,
          tasks: result.tasks,
          loadingTaskIds,
        };
      });
    } catch (error) {
      setState((prev) => {
        const loadingTaskIds = new Set(prev.loadingTaskIds);
        loadingTaskIds.delete(taskId);
        return {
          ...prev,
          loadingTaskIds,
          error: error as Error,
        };
      });
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return {
    tasks: state.tasks,
    isLoading: state.isLoading,
    loadingTaskIds: state.loadingTaskIds,
    error: state.error,
    addTask,
    editTask,
    deleteTask,
    loadTasks,
  };
}

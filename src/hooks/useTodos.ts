import { useCallback, useEffect, useState } from "react";
import { Task } from "../store/types";
import { TodoService } from "../services/todoService";
import { useNetworkStatus } from "./useNetworkStatus";

//TODO: move into .env
const todoService = new TodoService({
  baseUrl: "https://dummyjson.com",
  userId: 1,
});

interface State {
  tasks: Task[];
  isLoading: boolean;
  error: Error | null;
  loadingTaskIds: Set<string>;
}

const initialState: State = {
  tasks: [],
  isLoading: false,
  error: null,
  loadingTaskIds: new Set(),
};

export const useTodos = () => {
  const [state, setState] = useState<State>(initialState);
  const networkStatus = useNetworkStatus();
  const isOnline =
    !networkStatus.isOffline && networkStatus.isInternetReachable;

  const loadTasks = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
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

  const editTask = useCallback(
    async (taskId: string, updates: Partial<Task>) => {
      try {
        setState((prev) => {
          const newLoadingTaskIds = new Set(prev.loadingTaskIds);
          newLoadingTaskIds.add(taskId);
          return {
            ...prev,
            loadingTaskIds: newLoadingTaskIds,
          };
        });

        const result = await todoService.editTask(taskId, updates);

        setState((prev) => {
          const newLoadingTaskIds = new Set(prev.loadingTaskIds);
          newLoadingTaskIds.delete(taskId);
          return {
            ...prev,
            tasks: result.tasks,
            loadingTaskIds: newLoadingTaskIds,
          };
        });
      } catch (error) {
        setState((prev) => {
          const newLoadingTaskIds = new Set(prev.loadingTaskIds);
          newLoadingTaskIds.delete(taskId);
          return {
            ...prev,
            loadingTaskIds: newLoadingTaskIds,
            error: error as Error,
          };
        });
      }
    },
    []
  );

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      setState((prev) => {
        const newLoadingTaskIds = new Set(prev.loadingTaskIds);
        newLoadingTaskIds.add(taskId);
        return {
          ...prev,
          loadingTaskIds: newLoadingTaskIds,
        };
      });

      const result = await todoService.deleteTask(taskId);

      setState((prev) => {
        const newLoadingTaskIds = new Set(prev.loadingTaskIds);
        newLoadingTaskIds.delete(taskId);
        return {
          ...prev,
          tasks: result.tasks,
          loadingTaskIds: newLoadingTaskIds,
        };
      });
    } catch (error) {
      setState((prev) => {
        const newLoadingTaskIds = new Set(prev.loadingTaskIds);
        newLoadingTaskIds.delete(taskId);
        return {
          ...prev,
          loadingTaskIds: newLoadingTaskIds,
          error: error as Error,
        };
      });
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const { tasks: fetchedTasks } = await todoService.fetchTasks();
      setState((prev) => ({ ...prev, tasks: fetchedTasks }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err : new Error("Failed to fetch tasks"),
      }));
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
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
    fetchTasks,
  };
};

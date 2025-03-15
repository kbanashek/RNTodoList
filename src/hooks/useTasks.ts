import { useCallback, useEffect, useState } from "react";
import { Task } from "../store/types";
import { TodoService } from "../services/todoService";
import { useNetworkStatus } from "./useNetworkStatus";

interface State {
  todos: Task[];
  isLoading: boolean;
  loadingTodoIds: Set<string>;
  error: Error | null;
}

const initialState: State = {
  todos: [],
  isLoading: true,
  loadingTodoIds: new Set(),
  error: null,
};

const todoService = new TodoService({
  baseUrl: "https://dummyjson.com",
  userId: 10,
});

export function useTodos() {
  const [state, setState] = useState<State>(initialState);
  const networkStatus = useNetworkStatus();
  const isOnline =
    !networkStatus.isOffline && networkStatus.isInternetReachable;

  const loadTodos = useCallback(async () => {
    try {
      // First load from local storage
      const localResult = await todoService.init();
      setState((prev) => ({
        ...prev,
        todos: localResult.tasks,
      }));

      // Then fetch from API if online
      if (isOnline) {
        const apiResult = await todoService.fetchTasks();
        setState((prev) => ({
          ...prev,
          todos: apiResult.tasks,
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
      console.error("Error loading todos:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error as Error,
      }));
    }
  }, [isOnline]);

  const addTodo = useCallback(async (title: string) => {
    try {
      const result = await todoService.addTask(title);
      setState((prev) => ({
        ...prev,
        todos: result.tasks,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error as Error,
      }));
    }
  }, []);

  const editTodo = useCallback(
    async (todoId: string, updates: Partial<Task>) => {
      try {
        setState((prev) => ({
          ...prev,
          loadingTodoIds: new Set(prev.loadingTodoIds).add(todoId),
        }));

        const result = await todoService.editTask(todoId, updates);

        setState((prev) => {
          const loadingTodoIds = new Set(prev.loadingTodoIds);
          loadingTodoIds.delete(todoId);
          return {
            ...prev,
            todos: result.tasks,
            loadingTodoIds,
          };
        });
      } catch (error) {
        setState((prev) => {
          const loadingTodoIds = new Set(prev.loadingTodoIds);
          loadingTodoIds.delete(todoId);
          return {
            ...prev,
            loadingTodoIds,
            error: error as Error,
          };
        });
      }
    },
    []
  );

  const deleteTodo = useCallback(async (todoId: string) => {
    try {
      setState((prev) => ({
        ...prev,
        loadingTodoIds: new Set(prev.loadingTodoIds).add(todoId),
      }));

      const result = await todoService.deleteTask(todoId);

      setState((prev) => {
        const loadingTodoIds = new Set(prev.loadingTodoIds);
        loadingTodoIds.delete(todoId);
        return {
          ...prev,
          todos: result.tasks,
          loadingTodoIds,
        };
      });
    } catch (error) {
      setState((prev) => {
        const loadingTodoIds = new Set(prev.loadingTodoIds);
        loadingTodoIds.delete(todoId);
        return {
          ...prev,
          loadingTodoIds,
          error: error as Error,
        };
      });
    }
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  return {
    todos: state.todos,
    isLoading: state.isLoading,
    loadingTodoIds: state.loadingTodoIds,
    error: state.error,
    addTodo,
    editTodo,
    deleteTodo,
    loadTodos,
  };
}

import { useDispatch } from "react-redux";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect } from "react";
import { todoService } from "../services/todoService";
import { Task } from "../store/taskSlice";
import { setTasks } from "../store/taskSlice";
import type { QueryError } from "../types/api";
import { useNetworkStatus } from "./useServiceCheck";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TODOS_QUERY_KEY = ["todos"] as const;
const OFFLINE_TODOS_KEY = "offline_todos";
const PENDING_CHANGES_KEY = "pending_changes";

interface PendingChange {
  type: 'add' | 'update' | 'delete';
  task: Task;
  timestamp: number;
}

const isNotFoundError = (error: unknown): boolean => {
  return error instanceof Error && error.message.includes('not found');
};

const generateTempId = () => `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useTodos = () => {
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useQuery({
    queryKey: TODOS_QUERY_KEY,
    queryFn: async () => {
      try {
        if (!isConnected || !isInternetReachable) {
          const offlineTodos = await AsyncStorage.getItem(OFFLINE_TODOS_KEY);
          return offlineTodos ? JSON.parse(offlineTodos) : [];
        }
        const todos = await todoService.fetchTodos();
        await AsyncStorage.setItem(OFFLINE_TODOS_KEY, JSON.stringify(todos));
        return todos;
      } catch (error) {
        const offlineTodos = await AsyncStorage.getItem(OFFLINE_TODOS_KEY);
        if (offlineTodos) {
          return JSON.parse(offlineTodos);
        }
        throw error;
      }
    },
    staleTime: isConnected && isInternetReachable ? 30000 : Infinity,
    retry: isConnected && isInternetReachable ? 3 : 0,
  });
};

export const useAddTodo = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { isConnected, isInternetReachable } = useNetworkStatus();

  return useMutation({
    mutationFn: async ({ task, tempId }: { task: Omit<Task, "id">; tempId: string }) => {
      const newTask: Task = { ...task, id: tempId };

      if (!isConnected || !isInternetReachable) {
        const pendingChanges = await getPendingChanges();
        await AsyncStorage.setItem(PENDING_CHANGES_KEY, JSON.stringify([
          ...pendingChanges,
          { type: 'add', task: newTask, timestamp: Date.now() }
        ]));
        return newTask;
      }

      return todoService.addTodo(newTask);
    },
    onMutate: async ({ task, tempId }) => {
      await queryClient.cancelQueries({ queryKey: TODOS_QUERY_KEY });
      const previousTodos = queryClient.getQueryData<Task[]>(TODOS_QUERY_KEY) || [];
      const newTask: Task = { ...task, id: tempId };
      
      queryClient.setQueryData<Task[]>(TODOS_QUERY_KEY, old => {
        const todos = old || [];
        return [newTask, ...todos];
      });

      // Update offline storage
      const currentTodos = queryClient.getQueryData<Task[]>(TODOS_QUERY_KEY) || [];
      await AsyncStorage.setItem(OFFLINE_TODOS_KEY, JSON.stringify(currentTodos));

      return { previousTodos };
    },
    onError: (err, { tempId }, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData<Task[]>(
          TODOS_QUERY_KEY,
          context.previousTodos.filter(todo => todo.id !== tempId)
        );
        AsyncStorage.setItem(OFFLINE_TODOS_KEY, JSON.stringify(context.previousTodos));
      }
      console.error("Error adding todo:", err);
    },
    onSettled: async () => {
      if (isConnected && isInternetReachable) {
        await syncPendingChanges();
        queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
      }
    },
  });
};

export const useUpdateTodo = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { isConnected, isInternetReachable } = useNetworkStatus();

  return useMutation({
    mutationFn: async (task: Task) => {
      try {
        const updatedTodo = await todoService.updateTodo(task);
        return updatedTodo;
      } catch (error) {
        if (isNotFoundError(error)) {
          return task;
        }
        throw error;
      }
    },
    onMutate: async (task) => {
      await queryClient.cancelQueries({ queryKey: TODOS_QUERY_KEY });
      const previousTodos = queryClient.getQueryData<Task[]>(TODOS_QUERY_KEY) || [];

      const updatedTodos = previousTodos.map(todo => 
        todo.id === task.id ? task : todo
      );
      queryClient.setQueryData(TODOS_QUERY_KEY, updatedTodos);
      dispatch(setTasks(updatedTodos));

      // Update offline storage
      const currentTodos = queryClient.getQueryData<Task[]>(TODOS_QUERY_KEY) || [];
      await AsyncStorage.setItem(OFFLINE_TODOS_KEY, JSON.stringify(currentTodos));

      return { previousTodos };
    },
    onError: (error, task, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(TODOS_QUERY_KEY, context.previousTodos);
        dispatch(setTasks(context.previousTodos));
        AsyncStorage.setItem(OFFLINE_TODOS_KEY, JSON.stringify(context.previousTodos));
      }
      console.error("Error updating todo:", error);
    },
    onSettled: async () => {
      if (isConnected && isInternetReachable) {
        await syncPendingChanges();
        queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
      }
    },
  });
};

export const useToggleTodoComplete = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { isConnected, isInternetReachable } = useNetworkStatus();

  return useMutation({
    mutationFn: async (task: Task) => {
      try {
        const updatedTask = { ...task, completed: !task.completed };
        const updatedTodo = await todoService.updateTodo(updatedTask);
        return updatedTodo;
      } catch (error) {
        if (isNotFoundError(error)) {
          return { ...task, completed: !task.completed };
        }
        throw error;
      }
    },
    onMutate: async (task) => {
      await queryClient.cancelQueries({ queryKey: TODOS_QUERY_KEY });
      const previousTodos = queryClient.getQueryData<Task[]>(TODOS_QUERY_KEY) || [];

      const updatedTodos = previousTodos.map(todo => 
        todo.id === task.id ? { ...todo, completed: !todo.completed } : todo
      );
      queryClient.setQueryData(TODOS_QUERY_KEY, updatedTodos);
      dispatch(setTasks(updatedTodos));

      // Update offline storage
      const currentTodos = queryClient.getQueryData<Task[]>(TODOS_QUERY_KEY) || [];
      await AsyncStorage.setItem(OFFLINE_TODOS_KEY, JSON.stringify(currentTodos));

      return { previousTodos };
    },
    onError: (error, task, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(TODOS_QUERY_KEY, context.previousTodos);
        dispatch(setTasks(context.previousTodos));
        AsyncStorage.setItem(OFFLINE_TODOS_KEY, JSON.stringify(context.previousTodos));
      }
      console.error("Error toggling todo completion:", error);
    },
    onSettled: async () => {
      if (isConnected && isInternetReachable) {
        await syncPendingChanges();
        queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
      }
    },
  });
};

export const useDeleteTodo = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { isConnected, isInternetReachable } = useNetworkStatus();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await todoService.deleteTodo(id);
        return true;
      } catch (error) {
        if (isNotFoundError(error)) {
          return true;
        }
        throw error;
      }
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: TODOS_QUERY_KEY });
      const previousTodos = queryClient.getQueryData<Task[]>(TODOS_QUERY_KEY) || [];

      const updatedTodos = previousTodos.filter(todo => todo.id !== id);
      queryClient.setQueryData(TODOS_QUERY_KEY, updatedTodos);
      dispatch(setTasks(updatedTodos));

      // Update offline storage
      const currentTodos = queryClient.getQueryData<Task[]>(TODOS_QUERY_KEY) || [];
      await AsyncStorage.setItem(OFFLINE_TODOS_KEY, JSON.stringify(currentTodos));

      return { previousTodos };
    },
    onError: (error, id, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(TODOS_QUERY_KEY, context.previousTodos);
        dispatch(setTasks(context.previousTodos));
        AsyncStorage.setItem(OFFLINE_TODOS_KEY, JSON.stringify(context.previousTodos));
      }
      console.error("Error deleting todo:", error);
    },
    onSettled: async () => {
      if (isConnected && isInternetReachable) {
        await syncPendingChanges();
        queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
      }
    },
  });
};

async function getPendingChanges(): Promise<PendingChange[]> {
  const changes = await AsyncStorage.getItem(PENDING_CHANGES_KEY);
  return changes ? JSON.parse(changes) : [];
}

async function syncPendingChanges() {
  const pendingChanges = await getPendingChanges();
  if (pendingChanges.length === 0) return;

  // Sort by timestamp to maintain order
  const sortedChanges = pendingChanges.sort((a, b) => a.timestamp - b.timestamp);

  for (const change of sortedChanges) {
    try {
      switch (change.type) {
        case 'add':
          await todoService.addTodo(change.task);
          break;
        case 'update':
          await todoService.updateTodo(change.task);
          break;
        case 'delete':
          await todoService.deleteTodo(change.task.id);
          break;
      }
    } catch (error) {
      console.error(`Error syncing ${change.type} change:`, error);
      // Keep failed changes for retry
      const remainingChanges = pendingChanges.filter(c => c !== change);
      await AsyncStorage.setItem(PENDING_CHANGES_KEY, JSON.stringify(remainingChanges));
      return;
    }
  }

  // Clear pending changes after successful sync
  await AsyncStorage.setItem(PENDING_CHANGES_KEY, JSON.stringify([]));
}

export const useTodosSync = () => {
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isConnected && isInternetReachable) {
      syncPendingChanges();
      queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
    }
  }, [isConnected, isInternetReachable, queryClient]);
};

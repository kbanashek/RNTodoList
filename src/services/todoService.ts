import { Task } from "../store/taskSlice";
import { isNotFoundError } from "../types/api";
import { storage, StoredTodo } from "../storage/realm";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "https://dummyjson.com";
const userId = 20;
const OFFLINE_TODOS_KEY = "offline_todos";
const PENDING_CHANGES_KEY = "pending_changes";

interface PendingChange {
  type: "add" | "update" | "delete";
  task: Task;
  timestamp: number;
}

const transformTodoToTask = (todo: any): Task => {
  const task = {
    id: todo.id?.toString() || "",
    text: todo.todo || "",
    completed: todo.completed || false,
    date: new Date(todo.date || Date.now()).toLocaleDateString(),
  };
  return task;
};

const transformTaskToTodo = (task: Task) => {
  return {
    id: task.id,
    todo: task.text,
    completed: task.completed,
    userId,
  };
};

const handleApiResponse = async (response: Response) => {
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error("Invalid response from server");
  }

  if (!response.ok) {
    const error = new Error(data?.message || "Unknown error");
    if (data?.message?.includes("not found")) {
      (error as any).isNotFound = true;
    }
    throw error;
  }

  return data;
};

const taskToStoredTodo = (task: Task): StoredTodo => ({
  _id: task.id,
  text: task.text,
  completed: task.completed,
  date: task.date,
});

const storedTodoToTask = (todo: StoredTodo): Task => ({
  id: todo._id,
  text: todo.text,
  completed: todo.completed,
  date: todo.date,
});

class TodoService {
  private baseUrl = API_BASE_URL;

  /**
   * Fetches todos from storage or API
   */
  async fetchTodos(): Promise<Task[]> {
    try {
      const storedTodos = await storage.getTodos();
      if (storedTodos.length > 0) {
        console.log("Found stored todos:", JSON.stringify(storedTodos));
        return storedTodos.map(storedTodoToTask);
      }

      const response = await fetch(`${API_BASE_URL}/todos/user/${userId}`);
      const data = await handleApiResponse(response);
      const todos = data.todos.map((todo: any) => transformTodoToTask(todo));

      console.log("Storing fetched todos:", todos.length);
      // Store the initial todos
      await Promise.all(
        todos.map(async (todo: Task) => {
          await storage.addTodo(taskToStoredTodo(todo));
        })
      );

      await this.saveOfflineTodos(todos);

      return todos;
    } catch (error) {
      if (!isNotFoundError(error)) {
        console.error("Error fetching todos:", error);
      }
      // Return stored todos as fallback
      const storedTodos = await storage.getTodos();
      return storedTodos.map(storedTodoToTask);
    }
  }

  /**
   * Adds a new todo
   */
  async addTodo(task: Task): Promise<Task> {
    try {
      console.log("Adding todo:", task);
      const todoData = transformTaskToTodo(task);
      const response = await fetch(`${API_BASE_URL}/todos/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(todoData),
      });
      const data = await handleApiResponse(response);
      const newTask = transformTodoToTask(data);
      const finalTask = { ...newTask, id: task.id }; // Keep the original temp ID

      console.log("Storing new todo:", finalTask);
      // Store locally
      await storage.addTodo(taskToStoredTodo(finalTask));

      await this.saveOfflineTodos([finalTask]);

      return finalTask;
    } catch (error) {
      if (!isNotFoundError(error)) {
        console.error("Error adding todo:", error);
      }
      await this.addPendingChange({
        type: "add",
        task,
        timestamp: Date.now(),
      });
      await this.saveOfflineTodos([task]);
      return task;
    }
  }

  /**
   * Updates an existing todo
   */
  async updateTodo(task: Task): Promise<Task> {
    try {
      console.log("Updating todo:", task);
      const todoData = transformTaskToTodo(task);
      const response = await fetch(`${API_BASE_URL}/todos/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(todoData),
      });
      const data = await handleApiResponse(response);
      const updatedTask = transformTodoToTask(data);
      const finalTask = { ...updatedTask, id: task.id }; // Keep the original ID

      console.log("Storing updated todo:", finalTask);
      // Update locally
      await storage.updateTodo(taskToStoredTodo(finalTask));

      const todos = await this.getOfflineTodos();
      const updatedTodos = todos.map((t) => (t.id === task.id ? finalTask : t));
      await this.saveOfflineTodos(updatedTodos);

      return finalTask;
    } catch (error) {
      if (isNotFoundError(error)) {
        // Update locally even if API fails
        console.log("API update failed, updating locally:", task);
        await storage.updateTodo(taskToStoredTodo(task));
        const todos = await this.getOfflineTodos();
        const updatedTodos = todos.map((t) => (t.id === task.id ? task : t));
        await this.saveOfflineTodos(updatedTodos);
        return task;
      }
      console.error("Error updating todo:", error);
      await this.addPendingChange({
        type: "update",
        task,
        timestamp: Date.now(),
      });
      const todos = await this.getOfflineTodos();
      const updatedTodos = todos.map((t) => (t.id === task.id ? task : t));
      await this.saveOfflineTodos(updatedTodos);
      return task;
    }
  }

  /**
   * Deletes a todo
   */
  async deleteTodo(id: string): Promise<boolean> {
    try {
      console.log("Deleting todo:", id);
      const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: "DELETE",
      });
      await handleApiResponse(response);

      console.log("Deleting todo from storage:", id);
      // Delete locally
      await storage.deleteTodo(id);

      const todos = await this.getOfflineTodos();
      const updatedTodos = todos.filter((t) => t.id !== id);
      await this.saveOfflineTodos(updatedTodos);

      return true;
    } catch (error) {
      if (isNotFoundError(error)) {
        // Delete locally even if API fails
        console.log("API delete failed, deleting locally:", id);
        await storage.deleteTodo(id);
        const todos = await this.getOfflineTodos();
        const updatedTodos = todos.filter((t) => t.id !== id);
        await this.saveOfflineTodos(updatedTodos);
        return true;
      }
      console.error("Error deleting todo:", error);
      throw error;
    }
  }

  /**
   * Gets offline todos
   */
  private async getOfflineTodos(): Promise<Task[]> {
    const todos = await AsyncStorage.getItem(OFFLINE_TODOS_KEY);
    return todos ? JSON.parse(todos) : [];
  }

  /**
   * Saves offline todos
   */
  private async saveOfflineTodos(todos: Task[]): Promise<void> {
    await AsyncStorage.setItem(OFFLINE_TODOS_KEY, JSON.stringify(todos));
  }

  /**
   * Adds a pending change
   */
  private async addPendingChange(change: PendingChange): Promise<void> {
    try {
      const changes = await this.getPendingChanges();
      changes.push(change);
      await AsyncStorage.setItem(PENDING_CHANGES_KEY, JSON.stringify(changes));
    } catch (error) {
      console.error("Error adding pending change:", error);
      throw error;
    }
  }

  /**
   * Gets pending changes
   */
  public async getPendingChanges(): Promise<PendingChange[]> {
    try {
      const changes = await AsyncStorage.getItem(PENDING_CHANGES_KEY);
      return changes ? JSON.parse(changes) : [];
    } catch (error) {
      console.error("Error getting pending changes:", error);
      return [];
    }
  }

  /**
   * Clears pending changes
   */
  private async clearPendingChanges(): Promise<void> {
    try {
      await AsyncStorage.setItem(PENDING_CHANGES_KEY, JSON.stringify([]));
    } catch (error) {
      console.error("Error clearing pending changes:", error);
      throw error;
    }
  }

  /**
   * Syncs pending changes
   */
  async syncPendingChanges(): Promise<void> {
    try {
      const changes = await this.getPendingChanges();
      if (changes.length === 0) return;

      // Sort changes by timestamp to maintain order
      const sortedChanges = [...changes].sort(
        (a, b) => a.timestamp - b.timestamp
      );

      // Process each change in order
      for (const change of sortedChanges) {
        switch (change.type) {
          case "add":
            // Add task to server
            console.log("Syncing add task:", change.task);
            await this.addTodo(change.task);
            break;
          case "update":
            // Update task on server
            console.log("Syncing update task:", change.task);
            await this.updateTodo(change.task);
            break;
          case "delete":
            // Delete task from server
            console.log("Syncing delete task:", change.task);
            await this.deleteTodo(change.task.id);
            break;
        }
      }

      // Clear pending changes after successful sync
      await this.clearPendingChanges();
    } catch (error) {
      console.error("Error syncing pending changes:", error);
      throw error;
    }
  }
}

export const todoService = new TodoService();

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Task } from "../store/types";

const STORAGE_KEY = "@TodoApp:tasks";

export class TodoStorage {
  static async getTasks(): Promise<Task[]> {
    try {
      const storedTasks = await AsyncStorage.getItem(STORAGE_KEY);
      return storedTasks ? JSON.parse(storedTasks) : [];
    } catch (error) {
      console.error("Error getting tasks from storage:", error);
      return [];
    }
  }

  static async saveTasks(tasks: Task[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error("Error saving tasks to storage:", error);
      throw error;
    }
  }

  static async clearTasks(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing tasks from storage:", error);
      throw error;
    }
  }
}

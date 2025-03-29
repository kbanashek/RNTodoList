import Realm from 'realm';
import { Todo } from '../store/types';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import * as path from 'path';

// Define the Realm schema for Todo
class TodoSchema extends Realm.Object<TodoSchema> {
  id!: string;
  title!: string;
  completed!: boolean;
  createdAt!: string;
  updatedAt!: string;
  dueDate!: string | null;
  reminderDate!: string | null;
  reminderEnabled!: boolean;

  static schema = {
    name: 'Todo',
    primaryKey: 'id',
    properties: {
      id: 'string',
      title: 'string',
      completed: 'bool',
      createdAt: 'string',
      updatedAt: 'string',
      dueDate: 'string?',
      reminderDate: 'string?',
      reminderEnabled: 'bool',
    },
  };
}

export class TodoStorage {
  private static realm: Realm | null = null;
  private static readonly DB_NAME = 'rntodolist.realm';
  private static readonly EXPORT_DIR = 'realm-data';
  private static readonly PROJECT_EXPORT_DIR = 'realm-data';

  // Get the path to the Realm database file
  public static getRealmPath(): string {
    const documentsDir = FileSystem.documentDirectory;
    return `${documentsDir}${this.DB_NAME}`;
  }

  // Copy the Realm database to the realm-data directory in the app's document directory
  public static async copyToProjectDirectory(): Promise<string | null> {
    try {
      // First make sure Realm is closed
      await this.closeRealm();

      // Wait a moment to ensure file locks are released
      await new Promise(resolve => setTimeout(resolve, 500));

      // Source path (app's document directory)
      const sourcePath = this.getRealmPath();

      // Get document directory
      const documentDir = FileSystem.documentDirectory;
      if (!documentDir) {
        console.error('Could not determine document directory path');
        return null;
      }

      // Create a unique filename with timestamp to avoid conflicts
      const timestamp = new Date().getTime();
      const targetFilename = `rntodolist_export_${timestamp}.realm`;

      // Set up target directory
      const targetDir = `${documentDir}${this.PROJECT_EXPORT_DIR}`;

      // Create the target directory if it doesn't exist
      const dirInfo = await FileSystem.getInfoAsync(targetDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(targetDir, { intermediates: true });
      }

      // Target path with unique filename
      const targetPath = `${targetDir}/${targetFilename}`;

      // Check if source file exists
      const sourceInfo = await FileSystem.getInfoAsync(sourcePath);
      if (!sourceInfo.exists) {
        console.error(`Source file does not exist: ${sourcePath}`);
        return null;
      }

      // Read the source file as a base64 string
      const content = await FileSystem.readAsStringAsync(sourcePath, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Write the content to the target file
      await FileSystem.writeAsStringAsync(targetPath, content, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log(`Realm database copied to: ${targetPath}`);

      // Platform-specific guidance
      if (Platform.OS === 'ios') {
        console.log('To access this file on iOS:');
        console.log('1. Open Xcode');
        console.log('2. Run your app');
        console.log('3. Go to Window > Devices and Simulators');
        console.log('4. Select your simulator');
        console.log('5. Click the "+" button under "Installed Apps"');
        console.log(`6. Navigate to ${this.PROJECT_EXPORT_DIR}/${targetFilename}`);
      } else {
        console.log('To access this file on Android:');
        console.log('1. Connect to your device/emulator via ADB');
        console.log(
          `2. Run: adb pull /data/data/<your-package-name>/files/${this.PROJECT_EXPORT_DIR}/${targetFilename} ./`
        );
      }

      return targetPath;
    } catch (error) {
      console.error('Failed to copy Realm database:', error);
      return null;
    }
  }

  // Export the Realm database to the project directory for easier access
  public static async exportRealmForDevelopment(): Promise<string | null> {
    try {
      // Ensure Realm is closed before exporting
      await this.closeRealm();

      // Source path (app's document directory)
      const sourcePath = this.getRealmPath();

      // Create export directory if it doesn't exist
      const exportDir = `${FileSystem.documentDirectory}${this.EXPORT_DIR}`;
      const dirInfo = await FileSystem.getInfoAsync(exportDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(exportDir, { intermediates: true });
      }

      // Target path (in project directory)
      const targetPath = `${exportDir}/${this.DB_NAME}`;

      // Copy the database file
      await FileSystem.copyAsync({
        from: sourcePath,
        to: targetPath,
      });

      console.log(`Realm database exported to: ${targetPath}`);

      // Platform-specific guidance
      if (Platform.OS === 'ios') {
        console.log('To access this file:');
        console.log('1. Open Xcode');
        console.log('2. Run your app');
        console.log('3. Go to Window > Devices and Simulators');
        console.log('4. Select your simulator');
        console.log('5. Click the "+" button under "Installed Apps"');
        console.log(`6. Navigate to ${this.EXPORT_DIR}/${this.DB_NAME}`);
      } else {
        console.log('To access this file:');
        console.log('1. Connect to your device/emulator via ADB');
        console.log(
          `2. Run: adb pull /data/data/<your-package-name>/files/${this.EXPORT_DIR}/${this.DB_NAME} ./`
        );
      }

      return targetPath;
    } catch (error) {
      console.error('Failed to export Realm database:', error);
      return null;
    }
  }

  // Export todos as JSON to a file in the app's document directory
  public static async exportTodosAsJson(): Promise<string | null> {
    try {
      // Get all todos
      const todos = await this.getTodos();

      // Create a timestamp for the filename
      const timestamp = new Date().getTime();
      const filename = `todos_${timestamp}.json`;

      // Get document directory
      const documentDir = FileSystem.documentDirectory;
      if (!documentDir) {
        console.error('Could not determine document directory path');
        return null;
      }

      // Create the file path
      const filePath = `${documentDir}${filename}`;

      // Write todos to the file
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(todos, null, 2));

      // Log the path for debugging
      console.log(`\n==== EXPORT TODOS INFO ====`);
      console.log(`Todos exported to: ${filePath}`);
      console.log(`Filename: ${filename}`);
      console.log(`============================\n`);

      return filePath;
    } catch (error) {
      console.error('Failed to export todos:', error);
      return null;
    }
  }

  // Export todos as JSON directly to the realm-data directory in the project
  public static async exportTodosToProject(): Promise<string | null> {
    try {
      // Get all todos
      const todos = await this.getTodos();

      // Create a timestamp for the filename
      const timestamp = new Date().getTime();
      const filename = `todos_${timestamp}.json`;

      // Write to a temporary file in the app's document directory
      const tempFile = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(tempFile, JSON.stringify(todos, null, 2));

      console.log(`Todos exported to temporary file: ${tempFile}`);
      console.log("To copy this file to your project's realm-data directory:");
      console.log('1. Run the following command in your project root:');

      if (Platform.OS === 'ios') {
        console.log(`   xcrun simctl pbcopy booted < ${tempFile}`);
        console.log('2. Create a new file in realm-data directory and paste the content');
      } else {
        console.log('   Use adb to pull the file from the device:');
        console.log(`   adb pull ${tempFile} ./realm-data/${filename}`);
      }

      return tempFile;
    } catch (error) {
      console.error('Failed to export todos:', error);
      return null;
    }
  }

  private static async getRealm(): Promise<Realm> {
    if (!this.realm) {
      const realmPath = this.getRealmPath();

      // Log the path to make it easier to find
      console.log(`Realm database path: ${realmPath}`);

      // For development, you can also log a more user-friendly message
      if (__DEV__) {
        if (Platform.OS === 'ios') {
          console.log(
            'To find this file in Realm Studio, look in the iOS simulator Documents directory'
          );
          console.log(
            'Or use TodoStorage.exportRealmForDevelopment() to export it to an accessible location'
          );
          console.log(
            'Or use TodoStorage.copyToProjectDirectory() to copy it to the real-data directory'
          );
        } else {
          console.log(
            'To find this file in Realm Studio, use adb pull to extract it from the device'
          );
          console.log(
            'Or use TodoStorage.exportRealmForDevelopment() to export it to an accessible location'
          );
          console.log(
            'Or use TodoStorage.copyToProjectDirectory() to copy it to the real-data directory'
          );
        }
      }

      // In development mode, delete the Realm file to avoid migration issues
      if (__DEV__) {
        try {
          const exists = await FileSystem.getInfoAsync(realmPath);
          if (exists.exists) {
            await FileSystem.deleteAsync(realmPath);
            console.log('Deleted existing Realm database to avoid migration issues');
          }
        } catch (error) {
          console.error('Error deleting Realm database:', error);
        }
      }

      this.realm = await Realm.open({
        schema: [TodoSchema],
        schemaVersion: 7,
        path: realmPath,
        onMigration: (oldRealm, newRealm) => {
          // Handle migration for version 7 (adding reminderEnabled, dueDate, reminderDate)
          if (oldRealm.schemaVersion < 7) {
            const oldObjects = oldRealm.objects('Todo');
            const newObjects = newRealm.objects('Todo');

            // For each object, set default values for new fields if they don't exist
            for (let i = 0; i < oldObjects.length; i++) {
              const newObject = newObjects[i];

              // Set default values for new fields
              if (!newObject.hasOwnProperty('reminderEnabled')) {
                newObject.reminderEnabled = false;
              }
              if (!newObject.hasOwnProperty('dueDate')) {
                newObject.dueDate = null;
              }
              if (!newObject.hasOwnProperty('reminderDate')) {
                newObject.reminderDate = null;
              }
            }
          }
        },
      });
    }
    return this.realm;
  }

  static async getTodos(): Promise<Todo[]> {
    try {
      const realm = await this.getRealm();
      const realmTodos = realm.objects<TodoSchema>('Todo');

      // Convert Realm objects to plain JS objects
      return Array.from(realmTodos).map(todo => ({
        id: todo.id,
        title: todo.title,
        completed: todo.completed,
        createdAt: todo.createdAt,
        updatedAt: todo.updatedAt,
        dueDate: todo.dueDate,
        reminderDate: todo.reminderDate,
        reminderEnabled: todo.reminderEnabled,
      }));
    } catch (error) {
      console.error('Error getting tasks from Realm:', error);
      return [];
    }
  }

  static async saveTodos(tasks: Todo[]): Promise<void> {
    try {
      const realm = await this.getRealm();

      realm.write(() => {
        // Use update mode to handle existing objects
        tasks.forEach(task => {
          realm.create(
            'Todo',
            {
              id: task.id,
              title: task.title,
              completed: task.completed,
              createdAt: task.createdAt,
              updatedAt: task.updatedAt,
              dueDate: task.dueDate,
              reminderDate: task.reminderDate,
              reminderEnabled: task.reminderEnabled,
            },
            Realm.UpdateMode.Modified
          ); // Use the proper enum for update mode
        });
      });
    } catch (error) {
      console.error('Error saving tasks to Realm:', error);
      throw error;
    }
  }

  static async addTodo(task: Todo): Promise<void> {
    try {
      const realm = await this.getRealm();

      realm.write(() => {
        // Check if a todo with this ID already exists
        const existingTodo = realm.objectForPrimaryKey<TodoSchema>('Todo', task.id);

        if (existingTodo) {
          // Update the existing todo instead of creating a new one
          existingTodo.title = task.title;
          existingTodo.completed = task.completed;
          existingTodo.updatedAt = task.updatedAt;
          existingTodo.dueDate = task.dueDate;
          existingTodo.reminderDate = task.reminderDate;
          existingTodo.reminderEnabled = task.reminderEnabled;
          console.log(`Updated existing todo with ID ${task.id} instead of creating a new one`);
        } else {
          // Create a new todo
          realm.create('Todo', {
            id: task.id,
            title: task.title,
            completed: task.completed,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
            dueDate: task.dueDate,
            reminderDate: task.reminderDate,
            reminderEnabled: task.reminderEnabled,
          });
        }
      });
    } catch (error) {
      console.error('Error adding task to Realm:', error);
      throw error;
    }
  }

  static async updateTodo(taskId: string, updates: Partial<Todo>): Promise<void> {
    try {
      const realm = await this.getRealm();
      const todo = realm.objectForPrimaryKey<TodoSchema>('Todo', taskId);

      if (todo) {
        realm.write(() => {
          if (updates.title !== undefined) {
            todo.title = updates.title;
          }
          if (updates.completed !== undefined) {
            todo.completed = updates.completed;
          }
          if (updates.dueDate !== undefined) {
            todo.dueDate = updates.dueDate;
          }
          if (updates.reminderDate !== undefined) {
            todo.reminderDate = updates.reminderDate;
          }
          if (updates.reminderEnabled !== undefined) {
            todo.reminderEnabled = updates.reminderEnabled;
          }
          todo.updatedAt = new Date().toISOString();
        });
      }
    } catch (error) {
      console.error('Error updating task in Realm:', error);
      throw error;
    }
  }

  static async deleteTodo(taskId: string): Promise<void> {
    try {
      const realm = await this.getRealm();
      const todo = realm.objectForPrimaryKey<TodoSchema>('Todo', taskId);

      if (todo) {
        realm.write(() => {
          realm.delete(todo);
        });
      }
    } catch (error) {
      console.error('Error deleting task from Realm:', error);
      throw error;
    }
  }

  static async clearTodos(): Promise<void> {
    try {
      const realm = await this.getRealm();

      realm.write(() => {
        const allTodos = realm.objects('Todo');
        realm.delete(allTodos);
      });
    } catch (error) {
      console.error('Error clearing tasks from Realm:', error);
      throw error;
    }
  }

  // Close the Realm instance
  public static async closeRealm(): Promise<void> {
    if (this.realm) {
      this.realm.close();
      this.realm = null;
      console.log('Realm database closed');
    }
  }
}

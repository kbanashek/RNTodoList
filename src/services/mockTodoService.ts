import { Task } from "../store/taskSlice";
import { delay } from "../utils/delay";

// Mock data
const mockTodos: Task[] = [
  {
    id: "1",
    text: "Learn React Native",
    completed: true,
    date: new Date().toLocaleDateString(),
  },
  {
    id: "2",
    text: "Build a Todo App",
    completed: false,
    date: new Date().toLocaleDateString(),
  },
  {
    id: "3",
    text: "Write Unit Tests",
    completed: false,
    date: new Date().toLocaleDateString(),
  },
];

// Simulate network delay
const MOCK_DELAY = 500;

export const mockTodoService = {
  async fetchTodos(): Promise<Task[]> {
    await delay(MOCK_DELAY);
    return [...mockTodos];
  },

  async addTodo(task: Task): Promise<Task> {
    await delay(MOCK_DELAY);
    const newTask = { ...task };
    mockTodos.unshift(newTask);
    return newTask;
  },

  async updateTodo(task: Task): Promise<Task> {
    await delay(MOCK_DELAY);
    const index = mockTodos.findIndex(t => t.id === task.id);
    if (index === -1) {
      throw new Error("Todo not found");
    }
    mockTodos[index] = { ...task };
    return task;
  },

  async deleteTodo(id: string): Promise<boolean> {
    await delay(MOCK_DELAY);
    const index = mockTodos.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error("Todo not found");
    }
    mockTodos.splice(index, 1);
    return true;
  },
};

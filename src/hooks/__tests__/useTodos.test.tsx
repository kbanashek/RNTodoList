// import { renderHook } from '@testing-library/react-hooks';
// import { Provider } from 'react-redux';
// import { configureStore } from '@reduxjs/toolkit';
// import { useTodos } from '../useTodos';
// import { TodoService } from '../../services/todoService';
// import todoReducer from '../../store/todoSlice';
// import { useNetworkStatus } from '../useNetworkStatus';
// import { NetworkType, Task } from '../../store/types';
// import React from 'react';

// jest.mock('../../services/todoService');
// jest.mock('../useNetworkStatus');

// describe('useTodos', () => {
//   const mockTasks: Task[] = [
//     {
//       id: 'task1',
//       title: 'Test Task',
//       completed: false,
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString()
//     }
//   ];

//   beforeEach(() => {
//     jest.clearAllMocks();
//     (useNetworkStatus as jest.Mock).mockReturnValue({
//       isOffline: false,
//       isInternetReachable: true,
//       isConnected: true,
//       type: NetworkType.WIFI,
//       lastChecked: new Date().toISOString()
//     });
//     (TodoService.prototype.fetchTasks as jest.Mock).mockResolvedValue({ tasks: mockTasks });
//     (TodoService.prototype.init as jest.Mock).mockResolvedValue({ tasks: [] });
//   });

//   const wrapper = ({ children }: { children: React.ReactNode }) => {
//     const store = configureStore({
//       reducer: { todos: todoReducer },
//       preloadedState: {
//         todos: {
//           tasks: [],
//           isLoading: false,
//           error: null,
//           loadingTaskIds: []
//         }
//       }
//     });
//     return <Provider store={store}>{children}</Provider>;
//   };

//   it('loads tasks on mount', async () => {
//     const { result, waitForNextUpdate } = renderHook(() => useTodos(), { wrapper });
//     await waitForNextUpdate();

//     expect(TodoService.prototype.init).toHaveBeenCalled();
//     expect(TodoService.prototype.fetchTasks).toHaveBeenCalled();
//     expect(result.current.tasks).toEqual(mockTasks);
//   });

//   it('handles offline mode', async () => {
//     // Mock offline state before rendering the hook
//     (useNetworkStatus as jest.Mock).mockReturnValue({
//       isOffline: true,
//       isInternetReachable: false,
//       isConnected: false,
//       type: NetworkType.NONE,
//       lastChecked: new Date().toISOString()
//     });

//     const { result, waitForNextUpdate } = renderHook(() => useTodos(), { wrapper });
//     await waitForNextUpdate(); // Wait for init to complete

//     // Should call init but not fetchTasks when offline
//     expect(TodoService.prototype.init).toHaveBeenCalled();
//     expect(TodoService.prototype.fetchTasks).not.toHaveBeenCalled();
//     expect(result.current.tasks).toEqual([]); // Should only have local tasks
//   });

//   it('adds a task', async () => {
//     const newTask: Task = {
//       id: 'new_task',
//       title: 'New Task',
//       completed: false,
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString()
//     };

//     (TodoService.prototype.addTask as jest.Mock).mockResolvedValue({
//       tasks: [newTask, ...mockTasks]
//     });

//     const { result, waitForNextUpdate } = renderHook(() => useTodos(), { wrapper });
//     await waitForNextUpdate(); // Wait for initial load

//     result.current.addTodo('New Task');
//     await waitForNextUpdate(); // Wait for addTodo to complete

//     expect(TodoService.prototype.addTask).toHaveBeenCalledWith('New Task');
//     expect(result.current.tasks).toEqual([newTask, ...mockTasks]);
//   });

//   it('handles errors and updates loading state', async () => {
//     const error = new Error('Failed to add task');
//     (TodoService.prototype.addTask as jest.Mock).mockRejectedValue(error);

//     const { result, waitForNextUpdate } = renderHook(() => useTodos(), { wrapper });
//     await waitForNextUpdate(); // Wait for initial load

//     result.current.addTodo('New Task');
//     await waitForNextUpdate(); // Wait for error to be set

//     expect(result.current.error).toBe('Failed to add task');
//     expect(result.current.loadingTaskIds).toHaveLength(0);
//   });
// });

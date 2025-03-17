import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import networkReducer from './slices/networkSlice';
import todoReducer from './slices/todoSlice';

export const store = configureStore({
  reducer: {
    network: networkReducer,
    todos: todoReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore Set objects in the state
        ignoredPaths: ['todos.loadingTaskIds'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export * from './slices/networkSlice';
export * from './slices/todoSlice';

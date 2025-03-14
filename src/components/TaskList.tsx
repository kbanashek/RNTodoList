import React, { useState, useCallback, useEffect } from "react";
import { FlatList, StyleSheet, ListRenderItemInfo } from "react-native";
import TaskListItem from "./TaskListItem";
import { Task } from "../store/taskSlice";
import {
  useUpdateTodo,
  useDeleteTodo,
  useToggleTodoComplete,
  useTodos,
} from "../hooks/useTodos";
import { useNetworkStatus } from "../hooks/useServiceCheck";

interface TaskListItemProps {
  task: Task;
  isEditing: boolean;
  editText: string;
  isOffline: boolean;
  onToggleComplete: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task, newText: string) => void;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onChangeEditText: (text: string) => void;
  onSubmitEditText: () => void;
}

const TaskList: React.FC = () => {
  const { data: tasks = [], refetch } = useTodos();
  const { mutate: updateTodo } = useUpdateTodo();
  const { mutate: deleteTodo } = useDeleteTodo();
  const { mutate: toggleTodo } = useToggleTodoComplete();
  const { isConnected, isInternetReachable } = useNetworkStatus();

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [processedTasks, setProcessedTasks] = useState<Task[]>([]);

  useEffect(() => {
    const seen = new Set<string>();
    const uniqueTasks = tasks.filter((task: Task) => {
      if (!task.id) {
        console.warn("Task found with no ID:", task);
        return false;
      }
      if (seen.has(task.id)) {
        console.warn("Duplicate task ID found:", task.id, "Task:", task);
        return false;
      }
      seen.add(task.id);
      return true;
    });

    const sortedTasks = [...uniqueTasks].sort((a, b) => {
      const aIsTemp = a.id.startsWith("temp-");
      const bIsTemp = b.id.startsWith("temp-");
      if (aIsTemp && !bIsTemp) return -1;
      if (!aIsTemp && bIsTemp) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    if (uniqueTasks.length !== tasks.length) {
      refetch();
    }

    setProcessedTasks(sortedTasks);
  }, [tasks, refetch]);

  const handleToggleComplete = useCallback(
    (task: Task) => {
      toggleTodo(task);
    },
    [toggleTodo]
  );

  const handleDeleteTask = useCallback(
    (taskId: string) => {
      if (taskId.startsWith("temp-")) {
        console.warn("Attempting to delete temporary task:", taskId);
      }
      deleteTodo(taskId);
    },
    [deleteTodo]
  );

  const handleStartEditing = useCallback((task: Task) => {
    setEditText(task.text);
    setEditingTaskId(task.id);
  }, []);

  const handleCancelEditing = useCallback(() => {
    setEditingTaskId(null);
  }, []);

  const handleEditTask = useCallback(
    (task: Task, newText: string) => {
      const trimmedText = newText.trim();
      if (trimmedText && trimmedText !== task.text) {
        const updatedTask: Task = {
          ...task,
          text: trimmedText,
        };
        updateTodo(updatedTask);
      }
      setEditingTaskId(null);
    },
    [updateTodo]
  );

  const handleSubmitEdit = useCallback(
    (task: Task) => {
      const trimmedText = editText.trim();
      if (trimmedText && trimmedText !== task.text) {
        handleEditTask(task, trimmedText);
      } else {
        handleCancelEditing();
      }
    },
    [editText, handleEditTask, handleCancelEditing]
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Task>) => (
      <TaskListItem
        task={item}
        onToggleComplete={handleToggleComplete}
        onDeleteTask={handleDeleteTask}
        onEditTask={handleEditTask}
        isOffline={!isConnected || !isInternetReachable}
        isEditing={editingTaskId === item.id}
        editText={editText}
        onStartEditing={() => handleStartEditing(item)}
        onCancelEditing={handleCancelEditing}
        onChangeEditText={setEditText}
        onSubmitEditText={() => handleSubmitEdit(item)}
      />
    ),
    [
      editingTaskId,
      editText,
      isConnected,
      isInternetReachable,
      handleToggleComplete,
      handleDeleteTask,
      handleEditTask,
      handleStartEditing,
      handleCancelEditing,
      handleSubmitEdit,
    ]
  );

  const keyExtractor = useCallback((item: Task) => {
    if (!item.id) {
      return `error-${Date.now()}`;
    }
    return item.id;
  }, []);

  return (
    <FlatList
      data={processedTasks}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      bounces={true}
      removeClippedSubviews={true}
      initialNumToRender={10}
      maxToRenderPerBatch={5}
      updateCellsBatchingPeriod={50}
      windowSize={3}
      extraData={editingTaskId}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  completedItem: {
    opacity: 0.7,
  },
  completedText: {
    textDecorationLine: "line-through",
  },
  offlineItem: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
});

export default TaskList;

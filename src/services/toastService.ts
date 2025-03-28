import Toast from 'react-native-toast-message';
import { Todo } from '../store/types';
import { format } from 'date-fns';

/**
 * Toast notification service for the Todo app
 * This service provides functions to display toast notifications for overdue tasks and reminders
 */

// Custom toast styles for more eye-catching notifications
const toastStyles = {
  reminderContainer: {
    borderLeftColor: '#4DB6AC',
    borderLeftWidth: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    padding: 0,
    margin: 0,
  },
  overdueContainer: {
    borderLeftColor: '#FF5252',
    borderLeftWidth: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    padding: 0,
    margin: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  reminderTitle: {
    color: '#4DB6AC',
  },
  overdueTitle: {
    color: '#FF5252',
  },
  message: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.2,
    lineHeight: 20,
  },
};

// Format date for toast messages
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return format(date, 'MMM d, h:mm a');
  } catch (e) {
    return 'Invalid date';
  }
};

/**
 * Shows a toast notification for a reminder
 * @param task The task to show a reminder for
 */
export function showReminderToast(task: Todo) {
  Toast.show({
    type: 'info',
    text1: '⏰ Reminder',
    text2: `"${task.title}" - Due ${task.dueDate ? `at ${formatDate(task.dueDate)}` : 'soon'}`,
    position: 'bottom',
    visibilityTime: 5000,
    autoHide: true,
    topOffset: 30,
    bottomOffset: 50,
    props: {
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      ...toastStyles.reminderContainer,
      text1Style: { ...toastStyles.title, ...toastStyles.reminderTitle },
      text2Style: toastStyles.message,
    },
  });
}

/**
 * Shows a toast notification for an overdue task
 * @param task The overdue task
 */
export function showOverdueToast(task: Todo) {
  Toast.show({
    type: 'error',
    text1: '🚨 Task Overdue',
    text2: `"${task.title}" was due ${task.dueDate ? `at ${formatDate(task.dueDate)}` : ''}`,
    position: 'bottom',
    visibilityTime: 5000,
    autoHide: true,
    topOffset: 30,
    bottomOffset: 50,
    props: {
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      ...toastStyles.overdueContainer,
      text1Style: { ...toastStyles.title, ...toastStyles.overdueTitle },
      text2Style: toastStyles.message,
    },
  });
}

/**
 * Shows a toast notification for multiple overdue tasks
 * @param count The number of overdue tasks
 */
export function showMultipleOverdueToast(count: number) {
  Toast.show({
    type: 'error',
    text1: '🚨 Overdue Tasks',
    text2: `You have ${count} tasks that need attention`,
    position: 'bottom',
    visibilityTime: 5000,
    autoHide: true,
    topOffset: 30,
    bottomOffset: 50,
    props: {
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      ...toastStyles.overdueContainer,
      text1Style: { ...toastStyles.title, ...toastStyles.overdueTitle },
      text2Style: toastStyles.message,
    },
  });
}

/**
 * Shows a toast notification for multiple reminders
 * @param count The number of reminder tasks
 */
export function showMultipleReminderToast(count: number) {
  Toast.show({
    type: 'info',
    text1: '⏰ Reminders',
    text2: `You have ${count} tasks with active reminders`,
    position: 'bottom',
    visibilityTime: 5000,
    autoHide: true,
    topOffset: 30,
    bottomOffset: 50,
    props: {
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      ...toastStyles.reminderContainer,
      text1Style: { ...toastStyles.title, ...toastStyles.reminderTitle },
      text2Style: toastStyles.message,
    },
  });
}

/**
 * Checks for due and overdue tasks and shows appropriate toast notifications
 * @param tasks The list of tasks to check
 * @returns An object containing arrays of overdue tasks and reminder tasks
 */
export function checkForDueAndOverdueTasks(tasks: Todo[]) {
  const now = new Date();
  const overdueTasks = tasks.filter(
    task => !task.completed && task.dueDate && new Date(task.dueDate) < now
  );

  const reminderTasks = tasks.filter(
    task =>
      !task.completed &&
      task.reminderEnabled &&
      task.reminderDate &&
      new Date(task.reminderDate) < now
  );

  // Show toast notifications for overdue tasks
  if (overdueTasks.length > 0) {
    if (overdueTasks.length === 1) {
      showOverdueToast(overdueTasks[0]);
    } else {
      showMultipleOverdueToast(overdueTasks.length);
    }
  }

  // Show toast notifications for reminder tasks
  if (reminderTasks.length > 0) {
    if (reminderTasks.length === 1) {
      showReminderToast(reminderTasks[0]);
    } else {
      showMultipleReminderToast(reminderTasks.length);
    }
  }

  return { overdueTasks, reminderTasks };
}

import React, { useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import {
  Card,
  TextInput,
  Text,
  ActivityIndicator,
  IconButton,
  Menu,
  Button,
} from 'react-native-paper';
import { Todo } from '../store/types';
import { DatePickerModal } from 'react-native-paper-dates';
import { format } from 'date-fns';

interface TodoListItemProps {
  task: Todo;
  isLoading?: boolean;
  onToggleComplete: (taskId: string, completed: boolean) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (taskId: string, title: string) => void;
  onUpdateDueDate: (taskId: string, dueDate: string | null) => void;
}

export const TodoListItem = ({
  task,
  isLoading,
  onToggleComplete,
  onDeleteTask,
  onEditTask,
  onUpdateDueDate,
}: TodoListItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [menuVisible, setMenuVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const handleSave = () => {
    const trimmedTitle = editedTitle.trim();
    if (trimmedTitle && trimmedTitle !== task.title) {
      onEditTask(task.id, trimmedTitle);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(task.title);
    setIsEditing(false);
  };

  const handleDateConfirm = ({ date }: { date: Date }) => {
    setDatePickerVisible(false);
    if (date) {
      onUpdateDueDate(task.id, date.toISOString());
    }
  };

  const handleClearDueDate = () => {
    onUpdateDueDate(task.id, null);
    setMenuVisible(false);
  };

  const formatDueDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return null;
    }
  };

  const formattedDueDate = task.dueDate ? formatDueDate(task.dueDate) : null;

  return (
    <Card style={styles.container}>
      <View style={styles.content}>
        <View
          style={[styles.checkboxContainer, task.completed && styles.checkboxContainerCompleted]}
        >
          {isLoading ? (
            <ActivityIndicator size={20} color="#bb86fc" />
          ) : (
            <IconButton
              icon={task.completed ? 'check-circle-outline' : 'circle-outline'}
              onPress={() => !isLoading && onToggleComplete(task.id, !task.completed)}
              iconColor={task.completed ? '#bb86fc' : 'rgba(255, 255, 255, 0.7)'}
              size={36}
              disabled={isLoading}
            />
          )}
        </View>
        <View style={styles.middleContent}>
          <View style={styles.titleRow}>
            {isEditing ? (
              <TextInput
                value={editedTitle}
                onChangeText={setEditedTitle}
                onSubmitEditing={handleSave}
                style={styles.input}
                mode="flat"
                autoFocus
                textColor="#ffffff"
                underlineColor="transparent"
                activeUnderlineColor="#bb86fc"
                disabled={isLoading}
                right={
                  <TextInput.Icon
                    icon="check"
                    onPress={handleSave}
                    disabled={isLoading || !editedTitle.trim() || editedTitle.trim() === task.title}
                    color={
                      isLoading || !editedTitle.trim() || editedTitle.trim() === task.title
                        ? 'rgba(255, 255, 255, 0.3)'
                        : '#bb86fc'
                    }
                  />
                }
              />
            ) : (
              <>
                <Text
                  style={[
                    styles.title,
                    task.completed && styles.completedTitle,
                    isLoading && styles.loadingTitle,
                  ]}
                  numberOfLines={2}
                >
                  {task.title}
                </Text>
                <View style={styles.iconContainer}>
                  <IconButton
                    icon="pencil"
                    onPress={() => setIsEditing(true)}
                    iconColor="#bb86fc"
                    size={20}
                    disabled={isLoading}
                    style={styles.editButton}
                  />
                </View>
              </>
            )}
          </View>

          {task.dueDate && (
            <View style={styles.dueDateBadge}>
              <Text style={styles.dueDateText}>{formatDueDate(task.dueDate)}</Text>
            </View>
          )}
        </View>
        <View style={styles.actions}>
          {isEditing ? (
            <Pressable onPress={handleCancel} style={{ width: 20, height: 20 }}>
              <Text
                style={{
                  position: 'absolute',
                  color: '#cf6679',
                  fontSize: 16,
                  top: 0,
                  left: 0,
                  fontWeight: '600',
                }}
              >
                ×
              </Text>
            </Pressable>
          ) : (
            <>
              <IconButton
                icon="delete"
                onPress={() => onDeleteTask(task.id)}
                iconColor="#cf6679"
                size={20}
                disabled={isLoading}
                style={styles.actionIcon}
              />
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <IconButton
                    icon="calendar"
                    onPress={() => setMenuVisible(true)}
                    iconColor="#bb86fc"
                    size={20}
                    disabled={isLoading}
                    style={styles.actionIcon}
                  />
                }
              >
                <Menu.Item
                  onPress={() => {
                    setMenuVisible(false);
                    setDatePickerVisible(true);
                  }}
                  title="Set due date"
                  leadingIcon="calendar"
                />
                {task.dueDate && (
                  <Menu.Item
                    onPress={handleClearDueDate}
                    title="Clear due date"
                    leadingIcon="calendar-remove"
                  />
                )}
              </Menu>
            </>
          )}
        </View>
      </View>

      <DatePickerModal
        locale="en"
        mode="single"
        visible={datePickerVisible}
        onDismiss={() => setDatePickerVisible(false)}
        date={task.dueDate ? new Date(task.dueDate) : undefined}
        onConfirm={handleDateConfirm}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 4,
    backgroundColor: '#333333',
    elevation: 2,
    borderRadius: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    paddingRight: 8,
  },
  checkboxContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  checkboxContainerCompleted: {
    // borderColor: "#bb86fc",
    // backgroundColor: "rgba(187, 134, 252, 0.15)",
  },
  middleContent: {
    flex: 1,
    marginHorizontal: 8,
    marginRight: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    color: '#ffffff',
    flex: 1,
    marginRight: 8,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  loadingTitle: {
    opacity: 0.5,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    height: 40,
    paddingHorizontal: 0,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 4,
  },
  dueDateBadge: {
    backgroundColor: '#bb86fc',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  dueDateText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  editButton: {
    margin: 0,
    marginLeft: 4,
  },
  actionIcon: {
    margin: 0,
    marginLeft: 4,
  },
});

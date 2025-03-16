import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { TextInput, IconButton } from "react-native-paper";

interface AddTaskFormProps {
  onSubmit: (title: string) => void;
}

export function AddTodoForm({ onSubmit }: AddTaskFormProps) {
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    if (trimmedTitle && !isSubmitting) {
      try {
        setIsSubmitting(true);
        await onSubmit(trimmedTitle);
        setTitle("");
      } catch (error) {
        console.error("Error submitting task:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={title}
        onChangeText={setTitle}
        onSubmitEditing={handleSubmit}
        placeholder="Add a new task..."
        placeholderTextColor="rgba(255, 255, 255, 0.5)"
        style={styles.input}
        mode="outlined"
        textColor="#ffffff"
        outlineColor="rgba(255, 255, 255, 0.2)"
        activeOutlineColor="#bb86fc"
        right={
          <TextInput.Icon
            icon="plus"
            onPress={handleSubmit}
            disabled={!title.trim() || isSubmitting}
            color={
              !title.trim() || isSubmitting
                ? "rgba(255, 255, 255, 0.3)"
                : "#bb86fc"
            }
          />
        }
        disabled={isSubmitting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    backgroundColor: "transparent",
    fontSize: 16,
  },
});

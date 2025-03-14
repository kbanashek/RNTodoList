import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { TextInput, IconButton } from "react-native-paper";

interface AddTaskFormProps {
  onSubmit: (title: string) => Promise<void>;
}

export function AddTaskForm({ onSubmit }: AddTaskFormProps) {
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
      <View style={styles.inputContainer}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          onSubmitEditing={handleSubmit}
          placeholder="Add a new task..."
          mode="flat"
          style={styles.input}
          disabled={isSubmitting}
          textColor="#ffffff"
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
          underlineColor="transparent"
          activeUnderlineColor="#bb86fc"
        />
        <IconButton
          icon="plus-circle"
          size={24}
          onPress={handleSubmit}
          disabled={!title.trim() || isSubmitting}
          style={styles.button}
          iconColor={!title.trim() || isSubmitting ? "rgba(255, 255, 255, 0.3)" : "#bb86fc"}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    borderRadius: 4,
    paddingLeft: 16,
  },
  input: {
    flex: 1,
    backgroundColor: "transparent",
    fontSize: 16,
  },
  button: {
    margin: 0,
  },
});

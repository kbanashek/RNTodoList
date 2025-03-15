import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { TextInput } from "react-native-paper";

interface AddTodoFormProps {
  onSubmit: (title: string) => Promise<void>;
  isLoading?: boolean;
}

export function AddTodoForm({ onSubmit, isLoading = false }: AddTodoFormProps) {
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    if (trimmedTitle && !isSubmitting) {
      try {
        setIsSubmitting(true);
        await onSubmit(trimmedTitle);
        setTitle("");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const disabled = isLoading || isSubmitting || !title.trim();

  return (
    <View style={styles.container}>
      <TextInput
        value={title}
        onChangeText={setTitle}
        onSubmitEditing={handleSubmit}
        placeholder="Add a new todo..."
        placeholderTextColor="rgba(255, 255, 255, 0.5)"
        style={styles.input}
        mode="outlined"
        textColor="#ffffff"
        outlineColor="rgba(255, 255, 255, 0.2)"
        activeOutlineColor="#bb86fc"
        disabled={isLoading || isSubmitting}
        right={
          <TextInput.Icon
            icon={isSubmitting ? "loading" : "plus"}
            onPress={handleSubmit}
            disabled={disabled}
            color={disabled ? "rgba(255, 255, 255, 0.3)" : "#bb86fc"}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  input: {
    backgroundColor: "transparent",
  },
});

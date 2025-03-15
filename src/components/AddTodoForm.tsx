import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { TextInput } from "react-native-paper";

interface AddTodoFormProps {
  onSubmit: (title: string) => void;
}

export const AddTodoForm = ({ onSubmit }: AddTodoFormProps) => {
  const [title, setTitle] = useState("");

  const handleSubmit = () => {
    const trimmedTitle = title.trim();
    if (trimmedTitle) {
      onSubmit(trimmedTitle);
      setTitle("");
    }
  };

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
        right={
          <TextInput.Icon
            icon="plus"
            onPress={handleSubmit}
            disabled={!title.trim()}
            color={!title.trim() ? "rgba(255, 255, 255, 0.3)" : "#bb86fc"}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  input: {
    backgroundColor: "transparent",
  },
});

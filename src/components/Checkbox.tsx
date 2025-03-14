import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface CheckboxProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function Checkbox({ value, onValueChange }: CheckboxProps) {
  return (
    <TouchableOpacity
      style={[styles.checkbox, value && styles.checked]}
      onPress={() => onValueChange(!value)}
      activeOpacity={0.7}
    >
      {value && <Text style={styles.checkmark}>✓</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
  },
  checked: {
    backgroundColor: "#4CAF50",
  },
  checkmark: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

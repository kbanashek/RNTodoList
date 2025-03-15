import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface CustomCheckboxProps {
  checked: boolean;
  onPress: () => void;
  disabled?: boolean;
  color?: string;
}

export function CustomCheckbox({
  checked,
  onPress,
  disabled = false,
  color = '#bb86fc',
}: CustomCheckboxProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={styles.container}
    >
      <MaterialCommunityIcons
        name={checked ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"}
        size={32}
        color={checked ? color : "rgba(255, 255, 255, 0.7)"}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 2,
  },
});

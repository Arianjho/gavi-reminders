import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { ThemedText } from './ThemedText';

interface Props {
  label: string;
  onPress?: () => void;
  onRemove?: () => void;
  selected?: boolean;
}

export const TagChip: React.FC<Props> = ({ label, onPress, onRemove, selected }) => {
  const { theme } = useTheme();
  const bg = selected ? theme.colors.primary : theme.colors.chipBg;
  const fg = selected ? '#FFFFFF' : theme.colors.chipText;
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, { backgroundColor: bg }]}
      accessibilityRole="button"
      accessibilityLabel={`Etiqueta ${label}`}
    >
      <ThemedText variant="captionBold" color={fg}>
        #{label}
      </ThemedText>
      {onRemove ? (
        <Pressable onPress={onRemove} hitSlop={8} style={styles.remove}>
          <Ionicons name="close-circle" size={16} color={fg} />
        </Pressable>
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  remove: { marginLeft: 4 },
});

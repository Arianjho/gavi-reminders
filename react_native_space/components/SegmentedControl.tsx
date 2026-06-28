import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ThemedText } from './ThemedText';
import { hapticLight } from '../utils/haptics';

interface Props {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}

export const SegmentedControl: React.FC<Props> = ({ options, value, onChange }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.inputBg }]}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => {
              hapticLight();
              onChange(opt.value);
            }}
            style={[
              styles.segment,
              active && { backgroundColor: theme.colors.card },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <ThemedText
              variant="captionBold"
              color={active ? theme.colors.text : theme.colors.textTertiary}
            >
              {opt.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
});

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { ThemedText } from './ThemedText';
import { hapticLight } from '../utils/haptics';

interface Props {
  label: string;
  count: number;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

function hexToRgba(hex: string, alpha: number): string {
  try {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  } catch {
    return hex;
  }
}

export const SmartCard: React.FC<Props> = ({ label, count, color, icon, onPress }) => {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[styles.wrapper, animStyle]}>
      <Pressable
        onPressIn={() => {
          scale.value = withSpring(0.97, { damping: 14 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 14 });
        }}
        onPress={() => {
          hapticLight();
          onPress();
        }}
        style={[
          styles.card,
          { backgroundColor: isDark ? theme.colors.card : hexToRgba(color, 0.12) },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${count} recordatorios`}
      >
        <View style={styles.top}>
          <View style={[styles.iconCircle, { backgroundColor: color }]}>
            <Ionicons name={icon} size={18} color="#FFFFFF" />
          </View>
          <ThemedText variant="display" style={styles.count}>
            {count}
          </ThemedText>
        </View>
        <ThemedText variant="bodyBold" color={theme.colors.textSecondary}>
          {label}
        </ThemedText>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: { width: '48%', marginBottom: 12 },
  card: {
    borderRadius: 16,
    padding: 14,
    minHeight: 96,
    justifyContent: 'space-between',
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: { fontSize: 30 },
});

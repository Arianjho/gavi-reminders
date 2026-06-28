import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { hapticLight } from '../utils/haptics';

interface Props {
  onPress: () => void;
  bottomOffset?: number;
}

export const Fab: React.FC<Props> = ({ onPress, bottomOffset = 24 }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View
      style={[styles.wrapper, { bottom: bottomOffset + insets.bottom }, animStyle]}
    >
      <Pressable
        onPressIn={() => {
          scale.value = withSpring(0.92, { damping: 14 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 14 });
        }}
        onPress={() => {
          hapticLight();
          onPress();
        }}
        accessibilityRole="button"
        accessibilityLabel="Nuevo recordatorio"
      >
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.accent] as const}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          <Ionicons name="add" size={32} color="#FFFFFF" />
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: { position: 'absolute', right: 20 },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
});

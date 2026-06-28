import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  checked: boolean;
  color: string;
  onToggle: () => void;
  size?: number;
}

export const AnimatedCheckbox: React.FC<Props> = ({
  checked,
  color,
  onToggle,
  size = 26,
}) => {
  const scale = useSharedValue(1);
  const fill = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    fill.value = withTiming(checked ? 1 : 0, { duration: 200 });
  }, [checked, fill]);

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(1.2, { damping: 12 }),
      withSpring(1, { damping: 12 })
    );
    onToggle();
  };

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    opacity: fill.value,
    transform: [{ scale: 0.6 + fill.value * 0.4 }],
  }));

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={12}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={checked ? 'Marcar como pendiente' : 'Completar recordatorio'}
    >
      <Animated.View
        style={[
          styles.outer,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: checked ? color : '#C7C7CC',
          },
          animStyle,
        ]}
      >
        <Animated.View
          style={[
            styles.inner,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
            },
            fillStyle,
          ]}
        >
          <Ionicons name="checkmark" size={size * 0.6} color="#FFFFFF" />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  outer: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

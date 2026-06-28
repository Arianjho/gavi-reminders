import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { ThemedText } from './ThemedText';
import { hapticLight } from '../utils/haptics';

interface Props {
  title: string;
  showBack?: boolean;
  rightLabel?: string;
  onRightPress?: () => void;
  rightDisabled?: boolean;
  leftLabel?: string;
  onLeftPress?: () => void;
  titleColor?: string;
}

export const ScreenHeader: React.FC<Props> = ({
  title,
  showBack = true,
  rightLabel,
  onRightPress,
  rightDisabled = false,
  leftLabel,
  onLeftPress,
  titleColor,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBack = () => {
    hapticLight();
    if (onLeftPress) onLeftPress();
    else if (router.canGoBack()) router.back();
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 6,
          backgroundColor: theme.colors.background,
          borderBottomColor: theme.colors.separator,
        },
      ]}
    >
      <View style={styles.side}>
        {leftLabel ? (
          <Pressable onPress={handleBack} hitSlop={10} accessibilityRole="button">
            <ThemedText variant="body" color={theme.colors.primary}>
              {leftLabel}
            </ThemedText>
          </Pressable>
        ) : showBack ? (
          <Pressable
            onPress={handleBack}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Volver"
          >
            <Ionicons name="chevron-back" size={28} color={theme.colors.primary} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.center}>
        <ThemedText
          variant="h2"
          color={titleColor ?? theme.colors.text}
          numberOfLines={1}
        >
          {title}
        </ThemedText>
      </View>
      <View style={[styles.side, styles.right]}>
        {rightLabel ? (
          <Pressable
            onPress={() => {
              if (rightDisabled) return;
              hapticLight();
              onRightPress?.();
            }}
            hitSlop={10}
            disabled={rightDisabled}
            accessibilityRole="button"
          >
            <ThemedText
              variant="bodyBold"
              color={rightDisabled ? theme.colors.textTertiary : theme.colors.primary}
            >
              {rightLabel}
            </ThemedText>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  side: { minWidth: 70, justifyContent: 'center' },
  right: { alignItems: 'flex-end' },
  center: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
});

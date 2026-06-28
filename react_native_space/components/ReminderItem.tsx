import React, { useCallback } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { ThemedText } from './ThemedText';
import { AnimatedCheckbox } from './AnimatedCheckbox';
import { ReminderWithMeta } from '../types';
import { buildSubtitle } from '../utils/format';
import { hapticMedium } from '../utils/haptics';

interface Props {
  reminder: ReminderWithMeta;
  onToggleComplete: (reminder: ReminderWithMeta, completed: boolean) => void;
  onDelete: (reminder: ReminderWithMeta) => void;
  onPress: (reminder: ReminderWithMeta) => void;
  showTimeOnly?: boolean;
}

const ReminderItemBase: React.FC<Props> = ({
  reminder,
  onToggleComplete,
  onDelete,
  onPress,
  showTimeOnly = false,
}) => {
  const { theme } = useTheme();
  const completed = reminder.isCompleted === 1;
  const accent = reminder.list?.color ?? theme.colors.primary;

  const handleToggle = useCallback(() => {
    hapticMedium();
    onToggleComplete(reminder, !completed);
  }, [reminder, completed, onToggleComplete]);

  const subtitle = showTimeOnly
    ? reminder.time ?? ''
    : buildSubtitle(reminder.date, reminder.time);

  const renderRightActions = () => (
    <Pressable
      style={[styles.deleteAction, { backgroundColor: theme.colors.danger }]}
      onPress={() => onDelete(reminder)}
      accessibilityRole="button"
      accessibilityLabel="Eliminar recordatorio"
    >
      <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
      <ThemedText variant="captionBold" color="#FFFFFF" style={styles.deleteText}>
        Eliminar
      </ThemedText>
    </Pressable>
  );

  const content = (
    <Pressable
      onPress={() => onPress(reminder)}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: theme.colors.card,
          opacity: pressed ? 0.7 : completed ? 0.55 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={reminder.title}
    >
      <AnimatedCheckbox checked={completed} color={accent} onToggle={handleToggle} />
      <View style={styles.body}>
        <ThemedText
          variant="bodyBold"
          numberOfLines={2}
          style={[
            completed && {
              textDecorationLine: 'line-through',
              color: theme.colors.textTertiary,
            },
          ]}
        >
          {reminder.title}
        </ThemedText>
        {subtitle ? (
          <ThemedText variant="caption" color={theme.colors.textTertiary} style={styles.subtitle}>
            {subtitle}
          </ThemedText>
        ) : null}
        {reminder.tags?.length ? (
          <View style={styles.tagRow}>
            {reminder.tags.slice(0, 3).map((t) => (
              <ThemedText key={t.id} variant="caption" color={theme.colors.primary} style={styles.tagText}>
                #{t.name}
              </ThemedText>
            ))}
          </View>
        ) : null}
      </View>
      <View style={styles.meta}>
        {reminder.recurrence ? (
          <Ionicons
            name="repeat"
            size={16}
            color={theme.colors.textTertiary}
            style={styles.metaIcon}
          />
        ) : null}
        {reminder.isFlagged === 1 ? (
          <Ionicons name="flag" size={16} color={theme.colors.accent} style={styles.metaIcon} />
        ) : null}
        {reminder.list ? (
          <View style={[styles.dot, { backgroundColor: reminder.list.color }]} />
        ) : null}
      </View>
    </Pressable>
  );

  return (
    <Animated.View
      entering={FadeIn.duration(220)}
      exiting={FadeOut.duration(180)}
      style={styles.wrapper}
    >
      {Platform.OS === 'web' ? (
        content
      ) : (
        <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
          {content}
        </Swipeable>
      )}
      {Platform.OS === 'web' ? (
        <Pressable
          style={styles.webDelete}
          onPress={() => onDelete(reminder)}
          accessibilityRole="button"
          accessibilityLabel="Eliminar recordatorio"
        >
          <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
        </Pressable>
      ) : null}
    </Animated.View>
  );
};

export const ReminderItem = React.memo(ReminderItemBase);

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 8,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  body: { flex: 1, marginLeft: 12 },
  subtitle: { marginTop: 2 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  tagText: { marginRight: 8 },
  meta: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
  metaIcon: { marginLeft: 6 },
  dot: { width: 10, height: 10, borderRadius: 5, marginLeft: 8 },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 88,
  },
  deleteText: { marginTop: 2 },
  webDelete: {
    position: 'absolute',
    right: 10,
    top: 10,
    padding: 6,
  },
});

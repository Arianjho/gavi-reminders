import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../../context/ThemeContext';
import { useData } from '../../../context/DataContext';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { ThemedText } from '../../../components/ThemedText';
import { AnimatedCheckbox } from '../../../components/AnimatedCheckbox';
import { TagChip } from '../../../components/TagChip';
import { ConfirmSheet } from '../../../components/ConfirmSheet';
import { getReminderById } from '../../../services/database';
import { ReminderWithMeta } from '../../../types';
import { formatDateLong, recurrenceLabel } from '../../../utils/format';
import { hapticMedium } from '../../../utils/haptics';

export default function ReminderDetail() {
  const { reminderId = '' } = useLocalSearchParams<{ reminderId: string }>();
  const { theme } = useTheme();
  const router = useRouter();
  const { toggleComplete, removeReminder, refreshToken } = useData();
  const [reminder, setReminder] = useState<ReminderWithMeta | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const load = useCallback(async () => {
    setReminder(await getReminderById(reminderId));
  }, [reminderId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load, refreshToken])
  );

  const handleDelete = async () => {
    setConfirmVisible(false);
    if (reminder) await removeReminder(reminder);
    if (router.canGoBack()) router.back();
  };

  const completed = reminder?.isCompleted === 1;
  const accent = reminder?.list?.color ?? theme.colors.primary;

  const InfoRow = ({ icon, label, value, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; onPress?: () => void }) => (
    <Pressable
      style={[styles.infoRow, { borderBottomColor: theme.colors.separator }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Ionicons name={icon} size={20} color={theme.colors.textTertiary} />
      <ThemedText variant="body" color={theme.colors.textTertiary} style={styles.infoLabel}>
        {label}
      </ThemedText>
      <ThemedText variant="bodyBold" style={styles.infoValue} numberOfLines={1}>
        {value}
      </ThemedText>
    </Pressable>
  );

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader
        title="Detalle"
        rightLabel="Editar"
        onRightPress={() => router.push(`/reminder/${reminderId}/edit`)}
      />
      {reminder ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.titleCard, { backgroundColor: theme.colors.card }]}>
            <AnimatedCheckbox
              checked={completed}
              color={accent}
              size={30}
              onToggle={() => {
                hapticMedium();
                toggleComplete(reminder, !completed);
              }}
            />
            <ThemedText
              variant="h1"
              style={[styles.title, completed && { textDecorationLine: 'line-through', color: theme.colors.textTertiary }]}
            >
              {reminder.title}
            </ThemedText>
            {reminder.isFlagged === 1 ? (
              <Ionicons name="flag" size={22} color={theme.colors.accent} />
            ) : null}
          </View>

          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            {reminder.date ? (
              <InfoRow icon="calendar-outline" label="Fecha" value={formatDateLong(reminder.date)} />
            ) : null}
            {reminder.time ? (
              <InfoRow icon="time-outline" label="Hora" value={reminder.time} />
            ) : null}
            {reminder.recurrence ? (
              <InfoRow icon="repeat" label="Repetir" value={recurrenceLabel(reminder.recurrence)} />
            ) : null}
            {reminder.list ? (
              <InfoRow
                icon="list"
                label="Lista"
                value={`${reminder.list.emoji} ${reminder.list.name}`}
                onPress={() => reminder.list && router.push(`/list/${reminder.list.id}`)}
              />
            ) : null}
          </View>

          {reminder.tags.length > 0 ? (
            <View style={styles.tagSection}>
              {reminder.tags.map((t) => (
                <TagChip key={t.id} label={t.name} onPress={() => router.push(`/tag/${encodeURIComponent(t.name)}`)} />
              ))}
            </View>
          ) : null}

          {reminder.notes ? (
            <View style={[styles.card, { backgroundColor: theme.colors.card, padding: 14 }]}>
              <ThemedText variant="captionBold" color={theme.colors.textTertiary} style={styles.notesLabel}>
                NOTAS
              </ThemedText>
              <ThemedText variant="body">{reminder.notes}</ThemedText>
            </View>
          ) : null}

          <Pressable
            style={[styles.deleteBtn, { backgroundColor: theme.colors.card }]}
            onPress={() => setConfirmVisible(true)}
            accessibilityRole="button"
          >
            <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
            <ThemedText variant="bodyBold" color={theme.colors.danger} style={styles.deleteText}>
              Eliminar Recordatorio
            </ThemedText>
          </Pressable>
        </ScrollView>
      ) : null}

      <ConfirmSheet
        visible={confirmVisible}
        title="¿Eliminar recordatorio?"
        message="Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        onCancel={() => setConfirmVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, paddingBottom: 60 },
  titleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  title: { flex: 1, marginHorizontal: 12 },
  card: { borderRadius: 14, marginBottom: 16, overflow: 'hidden' },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  infoLabel: { marginLeft: 12, width: 64 },
  infoValue: { flex: 1, textAlign: 'right' },
  tagSection: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  notesLabel: { marginBottom: 6, letterSpacing: 0.5 },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 8,
  },
  deleteText: { marginLeft: 8 },
});

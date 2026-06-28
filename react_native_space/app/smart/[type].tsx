import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ReminderItem } from '../../components/ReminderItem';
import { ReminderList } from '../../components/ReminderList';
import { EmptyState } from '../../components/EmptyState';
import { ThemedText } from '../../components/ThemedText';
import { getRemindersBySmartType } from '../../services/database';
import { ReminderWithMeta } from '../../types';

const TITLES: Record<string, string> = {
  hoy: 'Hoy',
  programadas: 'Programadas',
  todas: 'Todas',
  marcadas: 'Marcadas',
};

function periodOf(time: string | null): 'manana' | 'tarde' | 'noche' | 'sin' {
  if (!time) return 'sin';
  const hh = parseInt(time.split(':')[0] ?? '0', 10);
  if (hh >= 6 && hh < 12) return 'manana';
  if (hh >= 12 && hh < 18) return 'tarde';
  if (hh >= 18 && hh < 24) return 'noche';
  return 'sin';
}

export default function SmartView() {
  const { type = 'todas' } = useLocalSearchParams<{ type: string }>();
  const { theme } = useTheme();
  const router = useRouter();
  const { toggleComplete, removeReminder, refreshToken } = useData();
  const [items, setItems] = useState<ReminderWithMeta[]>([]);

  const load = useCallback(async () => {
    setItems(await getRemindersBySmartType(type));
  }, [type]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load, refreshToken])
  );

  const title = TITLES[type] ?? 'Recordatorios';
  const onPress = (r: ReminderWithMeta) => router.push(`/reminder/${r.id}`);

  if (type === 'hoy') {
    const groups = [
      { key: 'manana', label: 'Mañana (6:00–12:00)' },
      { key: 'tarde', label: 'Tarde (12:00–18:00)' },
      { key: 'noche', label: 'Noche (18:00–24:00)' },
      { key: 'sin', label: 'Sin hora' },
    ];
    const isEmpty = items.length === 0;
    return (
      <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
        <ScreenHeader title={title} />
        {isEmpty ? (
          <EmptyState title="No hay recordatorios" subtitle="Disfruta tu día libre." />
        ) : (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {groups.map((g) => {
              const groupItems = items.filter((r) => periodOf(r.time) === g.key);
              if (groupItems.length === 0) return null;
              return (
                <View key={g.key} style={styles.group}>
                  <ThemedText variant="captionBold" color={theme.colors.textTertiary} style={styles.groupTitle}>
                    {g.label.toUpperCase()}
                  </ThemedText>
                  {groupItems.map((r) => (
                    <ReminderItem
                      key={r.id}
                      reminder={r}
                      onToggleComplete={toggleComplete}
                      onDelete={removeReminder}
                      onPress={onPress}
                      showTimeOnly
                    />
                  ))}
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader title={title} />
      <ReminderList
        reminders={items}
        onToggleComplete={toggleComplete}
        onDelete={removeReminder}
        onPress={onPress}
        emptyTitle="No hay recordatorios"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, paddingBottom: 120 },
  group: { marginBottom: 16 },
  groupTitle: { marginBottom: 8, letterSpacing: 0.5 },
});

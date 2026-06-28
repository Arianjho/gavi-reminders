import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ReminderList } from '../../components/ReminderList';
import { getRemindersByTag } from '../../services/database';
import { ReminderWithMeta } from '../../types';

export default function TagDetail() {
  const { tagName = '' } = useLocalSearchParams<{ tagName: string }>();
  const { theme } = useTheme();
  const router = useRouter();
  const { toggleComplete, removeReminder, refreshToken } = useData();
  const [items, setItems] = useState<ReminderWithMeta[]>([]);
  const decoded = decodeURIComponent(tagName);

  const load = useCallback(async () => {
    if (!decoded) return;
    setItems(await getRemindersByTag(decoded));
  }, [decoded]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load, refreshToken])
  );

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader title={`#${decoded}`} />
      <ReminderList
        reminders={items}
        onToggleComplete={toggleComplete}
        onDelete={removeReminder}
        onPress={(r) => router.push(`/reminder/${r.id}`)}
        emptyTitle="No hay recordatorios"
      />
    </View>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });

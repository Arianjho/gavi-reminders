import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../../context/ThemeContext';
import { useData } from '../../../context/DataContext';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { ReminderForm } from '../../../components/ReminderForm';
import { getReminderById } from '../../../services/database';
import { ReminderInput, ReminderWithMeta } from '../../../types';

export default function EditReminder() {
  const { reminderId = '' } = useLocalSearchParams<{ reminderId: string }>();
  const { theme } = useTheme();
  const router = useRouter();
  const { editReminder } = useData();
  const formRef = useRef<(() => ReminderInput) | null>(null);
  const [valid, setValid] = useState(true);
  const [reminder, setReminder] = useState<ReminderWithMeta | null>(null);

  useEffect(() => {
    (async () => {
      setReminder(await getReminderById(reminderId));
    })();
  }, [reminderId]);

  const handleSave = async () => {
    if (!formRef.current || !reminder) return;
    const input = formRef.current();
    if (!input.title.trim()) return;
    await editReminder(reminderId, input, reminder.notificationId ?? null);
    if (router.canGoBack()) router.back();
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader
        title="Editar Recordatorio"
        leftLabel="Cancelar"
        rightLabel="Guardar"
        rightDisabled={!valid}
        onRightPress={handleSave}
      />
      {reminder ? (
        <ReminderForm
          initial={{
            title: reminder.title,
            notes: reminder.notes,
            date: reminder.date,
            time: reminder.time,
            isFlagged: reminder.isFlagged,
            recurrence: reminder.recurrence,
            listId: reminder.listId,
            tagNames: reminder.tags.map((t) => t.name),
          }}
          onValidChange={setValid}
          formRef={formRef}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });

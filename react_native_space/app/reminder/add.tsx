import React, { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ReminderForm } from '../../components/ReminderForm';
import { ReminderInput } from '../../types';

export default function AddReminder() {
  const { listId = '' } = useLocalSearchParams<{ listId: string }>();
  const { theme } = useTheme();
  const router = useRouter();
  const { saveNewReminder } = useData();
  const formRef = useRef<(() => ReminderInput) | null>(null);
  const [valid, setValid] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!formRef.current || saving) return;
    const input = formRef.current();
    if (!input.title.trim()) return;
    setSaving(true);
    await saveNewReminder(input);
    if (router.canGoBack()) router.back();
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader
        title="Nuevo Recordatorio"
        leftLabel="Cancelar"
        rightLabel="Añadir"
        rightDisabled={!valid}
        onRightPress={handleSave}
      />
      <ReminderForm
        presetListId={listId || null}
        onValidChange={setValid}
        formRef={formRef}
      />
    </View>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });

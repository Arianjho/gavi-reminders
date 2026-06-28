import React, { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { ScreenHeader } from '../components/ScreenHeader';
import { ListForm } from '../components/ListForm';
import { createList } from '../services/database';

export default function ListCreate() {
  const { theme } = useTheme();
  const router = useRouter();
  const { triggerRefresh } = useData();
  const dataRef = useRef({ name: '', emoji: '\uD83D\uDCCB', color: '#007AFF' });
  const [valid, setValid] = useState(false);

  const handleCreate = async () => {
    const d = dataRef.current;
    if (!d.name.trim()) return;
    await createList(d.name, d.emoji, d.color);
    triggerRefresh();
    if (router.canGoBack()) router.back();
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader
        title="Nueva Lista"
        leftLabel="Cancelar"
        rightLabel="Crear"
        rightDisabled={!valid}
        onRightPress={handleCreate}
      />
      <ListForm
        onChange={(d) => {
          dataRef.current = d;
          setValid(d.name.trim().length > 0);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });

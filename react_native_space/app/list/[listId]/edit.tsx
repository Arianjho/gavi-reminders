import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../../context/ThemeContext';
import { useData } from '../../../context/DataContext';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { ListForm } from '../../../components/ListForm';
import { getListById, updateList } from '../../../services/database';
import { ListItem } from '../../../types';

export default function ListEdit() {
  const { listId = '' } = useLocalSearchParams<{ listId: string }>();
  const { theme } = useTheme();
  const router = useRouter();
  const { triggerRefresh } = useData();
  const [list, setList] = useState<ListItem | null>(null);
  const dataRef = useRef({ name: '', emoji: '\uD83D\uDCCB', color: '#007AFF' });
  const [valid, setValid] = useState(true);

  useEffect(() => {
    (async () => {
      const l = await getListById(listId);
      if (l) {
        setList(l);
        dataRef.current = { name: l.name, emoji: l.emoji, color: l.color };
      }
    })();
  }, [listId]);

  const handleSave = async () => {
    const d = dataRef.current;
    if (!d.name.trim()) return;
    await updateList(listId, d.name, d.emoji, d.color);
    triggerRefresh();
    if (router.canGoBack()) router.back();
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader
        title="Editar Lista"
        rightLabel="Guardar"
        rightDisabled={!valid}
        onRightPress={handleSave}
      />
      {list ? (
        <ListForm
          initialName={list.name}
          initialEmoji={list.emoji}
          initialColor={list.color}
          onChange={(d) => {
            dataRef.current = d;
            setValid(d.name.trim().length > 0);
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });

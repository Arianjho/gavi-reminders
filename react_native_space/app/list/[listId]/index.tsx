import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../../context/ThemeContext';
import { useData } from '../../../context/DataContext';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { ReminderList } from '../../../components/ReminderList';
import { SegmentedControl } from '../../../components/SegmentedControl';
import { OptionSheet } from '../../../components/OptionSheet';
import { ConfirmSheet } from '../../../components/ConfirmSheet';
import { Fab } from '../../../components/Fab';
import { getListById, getRemindersByList } from '../../../services/database';
import { ListItem, ReminderWithMeta } from '../../../types';

export default function ListDetail() {
  const { listId = '' } = useLocalSearchParams<{ listId: string }>();
  const { theme } = useTheme();
  const router = useRouter();
  const { toggleComplete, removeReminder, removeList, refreshToken } = useData();
  const [list, setList] = useState<ListItem | null>(null);
  const [tab, setTab] = useState('pendientes');
  const [items, setItems] = useState<ReminderWithMeta[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const load = useCallback(async () => {
    if (!listId) return;
    setList(await getListById(listId));
    setItems(await getRemindersByList(listId, tab === 'completados'));
  }, [listId, tab]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load, refreshToken])
  );

  const handleDeleteList = async () => {
    setConfirmVisible(false);
    await removeList(listId);
    if (router.canGoBack()) router.back();
  };

  if (!listId) {
    return (
      <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
        <ScreenHeader title="Lista" />
      </View>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader
        title={list ? `${list.emoji} ${list.name}` : 'Lista'}
        rightLabel="\u22ef"
        onRightPress={() => setMenuVisible(true)}
      />
      <View style={styles.segment}>
        <SegmentedControl
          options={[
            { label: 'Pendientes', value: 'pendientes' },
            { label: 'Completados', value: 'completados' },
          ]}
          value={tab}
          onChange={setTab}
        />
      </View>
      <ReminderList
        reminders={items}
        onToggleComplete={toggleComplete}
        onDelete={removeReminder}
        onPress={(r) => router.push(`/reminder/${r.id}`)}
        emptyTitle={tab === 'pendientes' ? 'No hay pendientes' : 'No hay completados'}
      />
      <Fab onPress={() => router.push(`/reminder/add?listId=${listId}`)} />

      <OptionSheet
        visible={menuVisible}
        title={list?.name ?? 'Lista'}
        options={[
          { label: 'Editar Lista', value: 'edit' },
          { label: 'Eliminar Lista', value: 'delete' },
        ]}
        selectedValue={null}
        onSelect={(v) => {
          if (v === 'edit') router.push(`/list/${listId}/edit`);
          else setConfirmVisible(true);
        }}
        onClose={() => setMenuVisible(false)}
      />
      <ConfirmSheet
        visible={confirmVisible}
        title="¿Eliminar lista?"
        message="Se eliminarán la lista y todos sus recordatorios."
        onConfirm={handleDeleteList}
        onCancel={() => setConfirmVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  segment: { paddingHorizontal: 16, paddingVertical: 12 },
});

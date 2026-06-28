import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';
import { ThemedText } from '../../components/ThemedText';
import { SmartCard } from '../../components/SmartCard';
import { ListRow } from '../../components/ListRow';
import { Fab } from '../../components/Fab';
import { SMART_COLORS } from '../../theme/theme';
import {
  getLists,
  getSmartCounts,
  getAllTags,
  SmartCounts,
} from '../../services/database';
import { ListWithCount, TagWithCount } from '../../types';

export default function Dashboard() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { refreshToken } = useData();
  const [counts, setCounts] = useState<SmartCounts>({
    hoy: 0,
    programadas: 0,
    todas: 0,
    marcadas: 0,
  });
  const [lists, setLists] = useState<ListWithCount[]>([]);
  const [tags, setTags] = useState<TagWithCount[]>([]);

  const load = useCallback(async () => {
    setCounts(await getSmartCounts());
    setLists(await getLists());
    setTags(await getAllTags());
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load, refreshToken])
  );

  const visibleTags = tags.slice(0, 5);
  const hasMoreTags = tags.length > 5;

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText variant="display" style={styles.heading}>
          Gavi Reminders
        </ThemedText>

        <View style={styles.grid}>
          <SmartCard
            label="Hoy"
            count={counts.hoy}
            color={SMART_COLORS.hoy}
            icon="today"
            onPress={() => router.push('/smart/hoy')}
          />
          <SmartCard
            label="Programadas"
            count={counts.programadas}
            color={SMART_COLORS.programadas}
            icon="time"
            onPress={() => router.push('/smart/programadas')}
          />
          <SmartCard
            label="Todas"
            count={counts.todas}
            color={SMART_COLORS.todas}
            icon="file-tray-stacked"
            onPress={() => router.push('/smart/todas')}
          />
          <SmartCard
            label="Marcadas"
            count={counts.marcadas}
            color={SMART_COLORS.marcadas}
            icon="star"
            onPress={() => router.push('/smart/marcadas')}
          />
        </View>

        <ThemedText variant="h2" style={styles.sectionTitle}>
          Mis Listas
        </ThemedText>
        {lists.map((l) => (
          <ListRow key={l.id} list={l} onPress={() => router.push(`/list/${l.id}`)} />
        ))}
        <Pressable
          style={styles.addList}
          onPress={() => router.push('/list-create')}
          accessibilityRole="button"
        >
          <Ionicons name="add-circle" size={22} color={theme.colors.primary} />
          <ThemedText variant="bodyBold" color={theme.colors.primary} style={styles.addListText}>
            Nueva Lista
          </ThemedText>
        </Pressable>

        <ThemedText variant="h2" style={styles.sectionTitle}>
          Etiquetas
        </ThemedText>
        {tags.length === 0 ? (
          <ThemedText variant="body" color={theme.colors.textTertiary}>
            No hay etiquetas todavía.
          </ThemedText>
        ) : (
          <View style={styles.tagRow}>
            {visibleTags.map((t) => (
              <Pressable
                key={t.id}
                onPress={() => router.push(`/tag/${encodeURIComponent(t.name)}`)}
                style={[styles.tagChip, { backgroundColor: theme.colors.chipBg }]}
              >
                <ThemedText variant="captionBold" color={theme.colors.chipText}>
                  #{t.name}
                </ThemedText>
              </Pressable>
            ))}
            {hasMoreTags ? (
              <Pressable
                onPress={() => router.push('/tags')}
                style={[styles.tagChip, { backgroundColor: theme.colors.primary }]}
              >
                <ThemedText variant="captionBold" color="#FFFFFF">
                  Ver todas
                </ThemedText>
              </Pressable>
            ) : null}
          </View>
        )}
      </ScrollView>
      <Fab onPress={() => router.push('/reminder/add')} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, paddingBottom: 120 },
  heading: { marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  sectionTitle: { marginTop: 16, marginBottom: 12 },
  addList: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 4 },
  addListText: { marginLeft: 8 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap' },
  tagChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, marginBottom: 8 },
});
